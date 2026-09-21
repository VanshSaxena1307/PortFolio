import React from 'react';

interface BuildingVolumeMeshProps {
  width: number;
  depth: number;
  height: number;
  color?: string;
  accentColor?: string;
  windowPattern?: string;
  facadeStyle?: string;
  className?: string;
  style?: React.CSSProperties;
  roofChildren?: React.ReactNode;
  frontChildren?: React.ReactNode;
  eastChildren?: React.ReactNode;
  children?: React.ReactNode;
}

export const BuildingVolumeMesh: React.FC<BuildingVolumeMeshProps> = ({
  width,
  depth,
  height,
  color,
  accentColor,
  windowPattern = 'grid',
  facadeStyle,
  className = '',
  style,
  roofChildren,
  frontChildren,
  eastChildren,
  children,
}) => {
  return (
    <div
      className={`bldg-volume-mesh ${facadeStyle ? `facade-${facadeStyle}` : ''} ${className}`}
      style={{
        width: `${width}px`,
        height: `${depth}px`,
        ...style,
      }}
    >
      {/* South Front Face */}
      <div
        className="bldg-face-front"
        style={{
          height: `${height}px`,
          backgroundColor: color,
          borderColor: accentColor ? `${accentColor}33` : undefined,
        }}
      >
        <div className={`windows-${windowPattern}`} />
        {frontChildren}
      </div>

      {/* East Face */}
      <div
        className="bldg-face-east"
        style={{
          width: `${height}px`,
          borderColor: accentColor ? `${accentColor}22` : undefined,
        }}
      >
        <div className={`windows-${windowPattern}`} />
        {eastChildren}
      </div>

      {/* West Shadow Face */}
      <div
        className="bldg-face-west"
        style={{
          width: `${height}px`,
        }}
      />

      {/* North Shadow Face */}
      <div
        className="bldg-face-north"
        style={{
          height: `${height}px`,
        }}
      />

      {/* Top Roof Face */}
      <div
        className="bldg-face-roof"
        style={{
          transform: `translate3d(0, 0, ${height}px)`,
          borderColor: accentColor ? `${accentColor}44` : undefined,
        }}
      >
        {roofChildren}
      </div>

      {/* Nested child volumes or attachments */}
      {children}
    </div>
  );
};
