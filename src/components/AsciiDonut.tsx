import { useEffect, useRef } from 'react';

const AsciiDonut = () => {
  const preRef = useRef<HTMLPreElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    let A = 0; // Rotation around X axis
    let B = 0; // Rotation around Z axis

    const animate = () => {
      if (!preRef.current) return;

      const width = 120;
      const height = 40;
      // Create buffers for output and z-buffer
      const output = new Array(width * height).fill(' ');
      const colorBuffer = new Array(width * height).fill('');
      const zbuffer = new Array(width * height).fill(0);

      // Torus parameters
      const R1 = 1;    // Minor radius (tube radius)
      const R2 = 2;    // Major radius (distance from center to tube center)
      const K2 = 5;    // Distance from viewer
      const K1 = 80 * K2 * 3 / (8 * (R1 + R2)); // Scale factor - keep donut same size

      // Iterate through the torus
      for (let theta = 0; theta < 6.28; theta += 0.07) { // 0 to 2π
        for (let phi = 0; phi < 6.28; phi += 0.02) { // 0 to 2π
          // Calculate 3D coordinates of point on torus
          const costheta = Math.cos(theta);
          const sintheta = Math.sin(theta);
          const cosphi = Math.cos(phi);
          const sinphi = Math.sin(phi);

          // 3D coordinates before rotation
          const circlex = R2 + R1 * costheta;
          const circley = R1 * sintheta;

          // Apply rotation around Y and X axes
          const x = circlex * (Math.cos(B) * cosphi + Math.sin(A) * Math.sin(B) * sinphi) - circley * Math.cos(A) * Math.sin(B);
          const y = circlex * (Math.sin(B) * cosphi - Math.sin(A) * Math.cos(B) * sinphi) + circley * Math.cos(A) * Math.cos(B);
          const z = K2 + Math.cos(A) * circlex * sinphi + circley * Math.sin(A);
          const ooz = 1 / z; // One over z for perspective

          // Project to 2D screen coordinates
          const xp = Math.floor(width / 2 + K1 * ooz * x);
          const yp = Math.floor(height / 2 - K1 * ooz * y);

          // Calculate luminance (lighting)
          const L = cosphi * costheta * Math.sin(B) - Math.cos(A) * costheta * sinphi - Math.sin(A) * sintheta + Math.cos(B) * (Math.cos(A) * sintheta - costheta * Math.sin(A) * sinphi);

          // Check if point is visible and within screen bounds
          if (L > 0 && xp >= 0 && xp < width && yp >= 0 && yp < height) {
            const idx = xp + yp * width;
            if (ooz > zbuffer[idx]) {
              zbuffer[idx] = ooz;
              
              // Choose ASCII character and color based on luminance
              const luminanceIndex = Math.floor(L * 8);
              const chars = '.,-~:;=!*#$@';
              output[idx] = chars[Math.max(0, Math.min(chars.length - 1, luminanceIndex))];
              
              // Map luminance to colors
              const colors = [
                '#1a0033', // Very dark purple
                '#2d1b4e', // Dark purple
                '#4a2c6b', // Medium purple
                '#663d88', // Purple
                '#8b5a9f', // Light purple
                '#b078b6', // Pink-purple
                '#d498cd', // Light pink
                '#f9b8e4', // Very light pink
                '#ffccff', // Lightest pink
                '#ffffff'  // White (brightest)
              ];
              colorBuffer[idx] = colors[Math.max(0, Math.min(colors.length - 1, luminanceIndex))];
            }
          }
        }
      }

      // Convert output array to HTML with colors
      let result = '';
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          const idx = j + i * width;
          const char = output[idx];
          const color = colorBuffer[idx];
          if (color) {
            result += `<span style="color: ${color}">${char}</span>`;
          } else {
            result += char;
          }
        }
        result += '\n';
      }

      preRef.current.innerHTML = result;

      // Update rotation angles
      A += 0.04;
      B += 0.02;

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Rotating ASCII Donut</h1>
        <div className="bg-black p-12 rounded-lg border shadow-lg min-w-[800px] min-h-[400px] flex items-center justify-center">
          <pre
            ref={preRef}
            className="text-green-400 font-mono text-sm leading-none whitespace-pre"
            style={{ 
              fontFamily: 'Courier New, monospace',
              userSelect: 'none'
            }}
          />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          3D ASCII torus with real-time trigonometric rotation
        </p>
      </div>
    </div>
  );
};

export default AsciiDonut;