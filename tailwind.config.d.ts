declare const _default: {
    darkMode: "class";
    content: string[];
    theme: {
        extend: {
            colors: {
                "aegis-black": string;
                "aegis-surface": string;
                "aegis-card": string;
                "aegis-border": string;
                "aegis-primary": string;
                "aegis-accent": string;
                "aegis-success": string;
                "aegis-warn": string;
                "aegis-danger": string;
                "aegis-text": string;
                "aegis-muted": string;
            };
            boxShadow: {
                glow: string;
            };
            backgroundImage: {
                grid: string;
            };
            animation: {
                pulseSlow: string;
                shimmer: string;
                float: string;
                scan: string;
            };
            keyframes: {
                shimmer: {
                    "0%": {
                        backgroundPosition: string;
                    };
                    "100%": {
                        backgroundPosition: string;
                    };
                };
                float: {
                    "0%, 100%": {
                        transform: string;
                    };
                    "50%": {
                        transform: string;
                    };
                };
                scan: {
                    "0%": {
                        transform: string;
                    };
                    "100%": {
                        transform: string;
                    };
                };
            };
        };
    };
    plugins: any[];
};
export default _default;
