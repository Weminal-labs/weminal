import React from 'react'

interface MergedShapeProps {
  fill?: string
  children?: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

const MergedShape: React.FC<MergedShapeProps> = ({
  fill = '#ffffff',
  children,
  style: containerStyle,
  className,
  ...props
}) => (
  <div
    className={className}
    style={{
      position: 'relative',
      width: 390,
      height: 420,
      ...containerStyle,
    }}
    {...props}
  >
    {/* Shape 1 */}
    <div
      style={{
        position: 'absolute',
        left: 190,
        top: 140,
        width: 200,
        height: 280,
        backgroundColor: fill,
        borderRadius: '0px 32px 32px 32px',
      }}
    />
    {/* Shape 2 */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 200,
        height: 140,
        backgroundColor: fill,
        borderRadius: '32px 32px 0px 32px',
      }}
    />
    {/* Negative Space 1 - Content container for empty region */}
    <div
      style={{
        position: 'absolute',
        left: 200,
        top: 0,
        width: 190,
        height: 140,
      }}
    />
    {/* Negative Space 2 - Content container for empty region */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 140,
        width: 190,
        height: 280,
      }}
    />
    {/* Bridge 1 */}
    <svg
      style={{
        position: 'absolute',
        left: 200,
        top: 108,
        width: 32,
        height: 32,
        pointerEvents: 'none',
      }}
      viewBox="0 0 32 32"
    >
      <path d="M 0 0 C 0 23.872 5.76 32 32 32 H 0 Z" fill={fill} />
    </svg>
    {/* Bridge 2 */}
    <svg
      style={{
        position: 'absolute',
        left: 158,
        top: 140,
        width: 32,
        height: 32,
        pointerEvents: 'none',
      }}
      viewBox="-32 -32 32 32"
    >
      <path d="M 0 0 C 0 -23.872 -5.76 -32 -32 -32 H 0 Z" fill={fill} />
    </svg>
    {children}
  </div>
)

export default MergedShape
