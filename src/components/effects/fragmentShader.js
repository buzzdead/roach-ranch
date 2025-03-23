const fragmentShader = `
  #ifdef GL_ES
  precision highp float;
  #endif

  uniform float time;
  uniform vec2 resolution;
  uniform float intensity;

  varying vec3 vPosition;

  // Simplex noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float noise3D(vec3 P) {
    vec3 i = floor(P);
    vec3 f = fract(P);
    vec3 u = f * f * (3.0 - 2.0 * f);
    vec3 a = mod289(i);
    vec4 aa = permute(permute(a.z + vec4(0.0, 1.0, 0.0, 1.0)) + a.y + vec4(0.0, 0.0, 1.0, 1.0)) + a.x;
    vec4 bb = permute(permute(a.z + vec4(0.0, 1.0, 0.0, 1.0)) + a.y + vec4(0.0, 0.0, 1.0, 1.0)) + a.x + 1.0;
    vec4 r = taylorInvSqrt(aa);
    vec4 x = fract(aa * 0.0243902439) * 2.0 - 1.0;
    vec4 y = abs(x) - 0.5;
    vec4 z = 1.0 - 2.0 * y;
    vec4 w = u.x * x + (1.0 - u.x) * y;
    float res = mix(mix(w.x, w.y, u.y), mix(w.z, w.w, u.y), u.z);
    return res * 1.0;
  }

  void main() {
    vec3 p = vPosition;

    // Add upward flow by offsetting p.y with time
    p.y += time * 0.5; // Fire moves upward over time

    // Distortion loop with fixed iterations
    vec2 R = vec2(11.0, 0.0);
    float F = 11.0;
    for (int i = 0; i < 5; i++) { // Fixed number of iterations
      R.x = F;
      float distortion = 0.4 * sin(F * dot(p.xy, sin(R + 1.0)) + 6.0 * time) * cos(R.x + time * 0.2) / F;
      p.xy += distortion;
      p.z += distortion * 0.5;
      F *= 1.2;
    }

    // Noise with time-based animation
    float N = noise3D(p * 4.0 + vec3(0.0, time * 0.3, 0.0));
    float d = length(p + vec3(0.0, time * 0.2 + 0.5, 0.0)) / 0.3 - (N + 1.0);
    N += noise3D(p * 8.0 + vec3(0.0, time * 0.5, 0.0));

    // Fire intensity
    float finalN = N + 1.0;
    float denominator = 0.5 - 0.1 * N + max(d / 0.1, -d) * abs(d) / 0.3;
    float fireIntensity = tanh(finalN / denominator) * intensity;

    // Fire gradient: red -> orange -> yellow -> white
    vec3 fireColor = vec3(1.0, 0.2, 0.0); // Red
    fireColor = mix(fireColor, vec3(1.0, 0.5, 0.0), clamp(fireIntensity * 2.0, 0.0, 1.0)); // Orange
    fireColor = mix(fireColor, vec3(1.0, 1.0, 0.0), clamp(fireIntensity * 1.5 - 0.5, 0.0, 1.0)); // Yellow
    fireColor = mix(fireColor, vec3(1.0, 1.0, 1.0), clamp(fireIntensity - 1.0, 0.0, 1.0)); // White

    // Adjust alpha for transparency at the edges
    float alpha = fireIntensity * (1.0 - length(vPosition.xz) * 0.5);
    alpha = clamp(alpha * 0.7, 0.0, 1.0);

    gl_FragColor = vec4(fireColor, alpha);
  }
`;

export default fragmentShader;