
import React from 'react';
import { Product } from '../../types';
import { useSettings } from '../../context/SettingsContext';

interface AnnotatedOverlayProps {
    products: {
        top: Product | null;
        bottom: Product | null;
        fullbody: Product | null;
        shoes: Product | null;
        accessories: Product[];
    };
    containerWidth?: number;
    containerHeight?: number;
}

const AnnotatedOverlay: React.FC<AnnotatedOverlayProps> = ({ products }) => {
    const { settings } = useSettings();
    // Map items to display with their target positions (normalized 0-100)
    const annotations = [];

    if (products.fullbody) {
        annotations.push({ product: products.fullbody, x: 70, y: 40, side: 'right' });
    } else {
        if (products.top) annotations.push({ product: products.top, x: 30, y: 30, side: 'left' });
        if (products.bottom) annotations.push({ product: products.bottom, x: 70, y: 60, side: 'right' });
    }

    if (products.shoes) {
        annotations.push({ product: products.shoes, x: 30, y: 85, side: 'left' });
    }

    products.accessories.forEach((acc, idx) => {
        // Stagger accessories
        annotations.push({ product: acc, x: 70, y: 20 + idx * 10, side: 'right' });
    });

    return (
        <div className="absolute inset-0 pointer-events-none select-none z-20">
            <svg className="w-full h-full overflow-visible">
                <defs>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="0"
                        refY="3.5"
                        orient="auto"
                    >
                        <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
                    </marker>
                </defs>

                {annotations.map((ann, i) => {
                    const isLeft = ann.side === 'left';
                    const labelMargin = 5; // Margin in % from the edge
                    const startX = isLeft ? labelMargin : (100 - labelMargin);
                    const endX = ann.x; // Point to item

                    return (
                        <g key={i}>
                            <line
                                x1={`${startX}%`}
                                y1={`${ann.y}%`}
                                x2={`${endX}%`}
                                y2={`${ann.y}%`}
                                stroke="black"
                                strokeWidth="0.8"
                                strokeOpacity="0.2"
                            />
                            <circle cx={`${endX}%`} cy={`${ann.y}%`} r="3" fill="black" fillOpacity="0.6" />
                        </g>
                    );
                })}
            </svg>

            {annotations.map((ann, i) => {
                const isLeft = ann.side === 'left';
                return (
                    <div
                        key={i}
                        className="absolute flex flex-col"
                        style={{
                            top: `${ann.y}%`,
                            [isLeft ? 'left' : 'right']: '2%',
                            transform: 'translateY(-50%)',
                            textAlign: isLeft ? 'left' : 'right',
                            alignItems: isLeft ? 'flex-start' : 'flex-end',
                            maxWidth: '35%' // Garante que o texto não "atravesse" a modelo
                        }}
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-black bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded-sm shadow-sm ring-1 ring-black/5">
                            {ann.product.name}
                        </p>
                        <p className="text-[9px] font-bold text-slate-500 bg-white/60 backdrop-blur-sm px-2 rounded-sm mt-0.5">
                            R$ {ann.product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                );
            })}
            {/* Branding */}
            <div className="absolute bottom-10 left-0 right-0 text-center animate-in fade-in duration-1000 slide-in-from-bottom-5">
                <h2 className="text-3xl md:text-5xl font-light tracking-[0.2em] text-black/80 uppercase" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {settings.storeName}
                </h2>
            </div>
        </div>
    );
};

export default AnnotatedOverlay;
