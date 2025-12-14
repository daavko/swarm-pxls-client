#version 300 es

precision highp float;

uniform float u_borderCutoff;
uniform vec4 u_selectedColor;

in vec2 v_texCoord;

out vec4 outColor;

void main() {
    vec2 distFromCenter = abs(v_texCoord - vec2(0.5));

    vec2 cutoff = step(distFromCenter, vec2(u_borderCutoff - 0.5));
    float alpha = cutoff.x * cutoff.y;

    outColor = mix(vec4(0.0, 0.0, 0.0, 1.0), u_selectedColor, alpha);
}
