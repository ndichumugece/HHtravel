import type { Variants } from 'framer-motion';

// Page Transition: Fade in + slight upward movement (10px) with smooth easing
export const pageVariants: Variants = {
    initial: {
        opacity: 0,
        y: 10,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.22,
            ease: [0.16, 1, 0.3, 1], // easeOutExpo
        },
    },
    exit: {
        opacity: 0,
        y: -10,
        transition: {
            duration: 0.15,
            ease: [0.7, 0, 0.84, 0],
        },
    },
};

// Card Variants: On load fade in + translateY(15px)
export const cardVariants: Variants = {
    initial: {
        opacity: 0,
        y: 15,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.35,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

// List Container variants (for staggered animations)
export const listContainerVariants: Variants = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.04,
        },
    },
};

// List Item variants
export const listItemVariants: Variants = {
    initial: {
        opacity: 0,
        y: 10,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.28,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};

// Modal zoom/fade variants
export const modalVariants: Variants = {
    initial: {
        opacity: 0,
        scale: 0.96,
        y: 6,
    },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.24,
            ease: [0.16, 1, 0.3, 1],
        },
    },
    exit: {
        opacity: 0,
        scale: 0.97,
        y: 6,
        transition: {
            duration: 0.18,
            ease: [0.7, 0, 0.84, 0],
        },
    },
};

// Drawer/Sidebar variants (slide in/out)
export const sidebarVariants: Variants = {
    initial: {
        x: '-100%',
        opacity: 0,
    },
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 420,
            damping: 38,
        },
    },
    exit: {
        x: '-100%',
        opacity: 0,
        transition: {
            duration: 0.2,
            ease: 'easeInOut',
        },
    },
};

export const drawerVariants: Variants = {
    initial: {
        x: '100%',
    },
    animate: {
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 36,
        },
    },
    exit: {
        x: '100%',
        transition: {
            duration: 0.22,
            ease: 'easeInOut',
        },
    },
};

// Table row variants
export const tableRowVariants: Variants = {
    initial: {
        opacity: 0,
        y: 4,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.22,
            ease: [0.16, 1, 0.3, 1],
        },
    },
};
