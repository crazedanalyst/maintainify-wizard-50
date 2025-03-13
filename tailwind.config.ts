
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Enhanced brand colors
				brand: {
					50: '#e6f5ff',
					100: '#cce8ff',
					200: '#99d1ff',
					300: '#66baff',
					400: '#3393ff', 
					500: '#0077ff',
					600: '#005ecc',
					700: '#0046a6',
					800: '#003380',
					900: '#001f59',
				},
				// Neomorphism UI colors
				neo: {
					bg: '#f0f4f8',
					shadow1: '#ffffff',
					shadow2: '#d1d9e6',
					highlight: '#ffffff',
					accent1: '#4d7cff',
					accent2: '#4da6ff',
					text: '#2a3a4a',
					muted: '#8a9db0',
				},
				// Status colors
				status: {
					stable: '#22c55e',
					review: '#f59e0b',
					critical: '#ef4444',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				slideIn: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				shimmer: {
					'100%': { transform: 'translateX(100%)' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.5s ease-out forwards',
				'slide-in': 'slideIn 0.3s ease-out forwards',
				'shimmer': 'shimmer 2s infinite',
			},
			boxShadow: {
				'neo-sm': '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
				'neo': '10px 10px 20px #d1d9e6, -10px -10px 20px #ffffff',
				'neo-lg': '15px 15px 30px #d1d9e6, -15px -15px 30px #ffffff',
				'neo-inner': 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
				'neo-btn': '3px 3px 6px #d1d9e6, -3px -3px 6px #ffffff',
				'neo-btn-pressed': 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
