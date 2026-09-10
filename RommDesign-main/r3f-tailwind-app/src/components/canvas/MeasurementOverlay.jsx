/**
 * MeasurementOverlay — room dimension labels rendered as 3D text sprites.
 *
 * Shows width and depth measurements along the room edges.
 */
import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';
import useStore from '../../store/useStore';

function MeasurementLabel({ position, text }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <div
        style={{
          background: 'rgba(99, 102, 241, 0.9)',
          color: '#fff',
          padding: '2px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'Inter, sans-serif',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(4px)',
        }}
      >
        {text}
      </div>
    </Html>
  );
}

function MeasurementLine({ start, end, color = '#6366f1' }) {
  const points = useMemo(
    () => [
      start,
      end,
    ],
    [start, end]
  );

  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={new Float32Array([...start, ...end])}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color={color} linewidth={2} />
    </line>
  );
}

export default function MeasurementOverlay() {
  const showMeasurements = useStore((s) => s.showMeasurements);
  const room = useStore((s) => s.room);

  if (!showMeasurements) return null;

  const { width, depth, height } = room;
  const hw = width / 2;
  const hd = depth / 2;

  return (
    <group>
      {/* Width measurement (along front edge) */}
      <MeasurementLabel
        position={[0, 0.05, hd + 0.5]}
        text={`${(width * 100).toFixed(0)} cm`}
      />
      <MeasurementLine
        start={[-hw, 0.05, hd + 0.3]}
        end={[hw, 0.05, hd + 0.3]}
      />

      {/* Depth measurement (along right edge) */}
      <MeasurementLabel
        position={[hw + 0.5, 0.05, 0]}
        text={`${(depth * 100).toFixed(0)} cm`}
      />
      <MeasurementLine
        start={[hw + 0.3, 0.05, -hd]}
        end={[hw + 0.3, 0.05, hd]}
      />

      {/* Height measurement (vertical, at corner) */}
      <MeasurementLabel
        position={[-hw - 0.5, height / 2, -hd]}
        text={`${(height * 100).toFixed(0)} cm`}
      />
    </group>
  );
}
