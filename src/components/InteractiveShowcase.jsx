import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import '../styles/InteractiveShowcase.css';

const VeggieDecor = ({ type, style }) => {
  return (
    <div style={{ position: 'absolute', pointerEvents: 'none', zIndex: 0, ...style }}>
      <svg 
        className={`veggie-anim veggie-${type}`}
        style={{ width: '100%', height: '100%', opacity: 0.08, color: '#000' }} 
        viewBox="0 0 100 100" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
      >
      {type === 'tomato' && (
        <path d="M50 25 C20 25 10 45 10 65 C10 85 30 95 50 95 C70 95 90 85 90 65 C90 45 80 25 50 25 M50 25 Q55 15 65 10 M50 25 Q40 15 35 20 M50 25 V15" strokeLinecap="round" strokeLinejoin="round"/>
      )}
      {type === 'onion' && (
        <path d="M50 15 C30 30 15 50 20 75 C25 90 40 95 50 95 C60 95 75 90 80 75 C85 50 70 30 50 15 M50 15 Q55 5 60 5 M50 15 Q45 5 40 10 M30 50 C40 60 60 60 70 50 M25 65 C40 75 60 75 75 65" strokeLinecap="round" strokeLinejoin="round"/>
      )}
      {type === 'chili' && (
        <path d="M80 20 Q90 10 95 15 Q100 20 90 30 C70 50 40 90 15 95 C5 97 0 90 5 80 C15 50 40 20 60 15 Q75 10 80 20 M60 15 Q70 5 80 20 M15 95 Q25 80 35 70 M5 80 Q20 90 30 95" strokeLinecap="round" strokeLinejoin="round"/>
      )}
      {type === 'garlic' && (
        <path d="M50 10 Q60 30 70 50 C80 70 70 90 50 90 C30 90 20 70 30 50 Q40 30 50 10 M50 90 V50 M35 75 Q45 60 50 50 M65 75 Q55 60 50 50 M30 50 C20 60 20 80 30 85 M70 50 C80 60 80 80 70 85" strokeLinecap="round" strokeLinejoin="round"/>
      )}
    </svg>
    </div>
  );
};

const InteractiveShowcase = () => {
  const showcaseItems = [
    {
      id: 1,
      productName: "Kachi Ghani Mustard Oil",
      productImages: ["./images/mustard850.png", "./images/MustardOilCan.png"],
      dishNames: ["Spicy Aloo Dum", "Rich Paneer Tikka"],
      dishImages: ["./authentic_aloo_dum.png", "./paneer_tikka.png"],
      titleLine1: "For Authentic",
      titleLine2: "Indian Flavours",
      subtitle: "with pure Kachi Ghani aroma",
      themeColor: "#ff9800",
      darkColor: "#e65100"
    },
    {
      id: 2,
      productName: "Refined Soyabean Oil",
      productImages: ["./images/soyabean850.png", "./images/SoyaBeansOilCan.png"],
      dishNames: ["Comforting Dal Tadka", "Fragrant Veg Pulao"],
      dishImages: ["./healthy_dal.png", "./veg_pulao.png"],
      titleLine1: "For Healthy",
      titleLine2: "Everyday Meals",
      subtitle: "with light & neutral taste",
      themeColor: "#4CAF50",
      darkColor: "#1B5E20"
    },
    {
      id: 3,
      productName: "Refined Cottonseed Oil",
      productImages: ["./images/cottonseed850.png"],
      dishNames: ["Crispy Samosas & Pakodas"],
      dishImages: ["./crispy_samosa.png"],
      titleLine1: "For Perfect",
      titleLine2: "Crispy Snacks",
      subtitle: "with zero heavy oily feel",
      themeColor: "#2196F3",
      darkColor: "#0D47A1"
    }
  ];

  return (
    <section id="products" className="interactive-showcase-section">
      {/* Kitchen Banner */}
      <div className="kitchen-banner">
        <h2>The Gold Mairani Kitchen</h2>
      </div>
      
      <div className="showcase-wrapper">
        {showcaseItems.map((item, index) => {
          const isReversed = index % 2 !== 0;
          
          return (
            <ShowcaseItem 
              key={item.id} 
              item={item} 
              isReversed={isReversed} 
            />
          );
        })}
      </div>
    </section>
  );
};

const ShowcaseItem = ({ item, isReversed }) => {
  const { ref, inView } = useInView({ threshold: 0.3, triggerOnce: true });
  const [imageIndex, setImageIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [autoplayActive, setAutoplayActive] = useState(true);

  // Natural automatic fade-in transition timer (4.5 seconds)
  React.useEffect(() => {
    if (item.productImages.length <= 1 || !autoplayActive) return;

    const interval = setInterval(() => {
      setDirection(1);
      setImageIndex((prev) => (prev + 1) % item.productImages.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [item.productImages.length, autoplayActive]);

  const handleNextImage = () => {
    setDirection(1);
    setImageIndex((prev) => (prev + 1) % item.productImages.length);
    // Pause autoplay for 8 seconds after manual user interaction, then resume naturally
    setAutoplayActive(false);
    const timeout = setTimeout(() => setAutoplayActive(true), 8000);
    return () => clearTimeout(timeout);
  };

  const handlePrevImage = () => {
    setDirection(-1);
    setImageIndex((prev) => (prev - 1 + item.productImages.length) % item.productImages.length);
    // Pause autoplay for 8 seconds after manual user interaction, then resume naturally
    setAutoplayActive(false);
    const timeout = setTimeout(() => setAutoplayActive(true), 8000);
    return () => clearTimeout(timeout);
  };

  // Variants for Dish Rotation
  const dishVariants = {
    enter: (dir) => ({
      rotate: dir === 1 ? 180 : -180,
      opacity: 0,
      scale: 0.8
    }),
    center: {
      rotate: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, type: "spring", bounce: 0.3 }
    },
    exit: (dir) => ({
      rotate: dir === 1 ? -180 : 180,
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.5 }
    })
  };

  // Variants for Bottle Slide
  const bottleVariants = {
    enter: (dir) => ({
      x: dir === 1 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: (dir) => ({
      x: dir === 1 ? -50 : 50,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  };

  return (
    <section className="showcase-section" ref={ref} style={{ padding: '40px 0' }}>
      {/* Dynamic BG shape for each section */}
      <div 
        className="showcase-bg-shape" 
        style={{ 
          backgroundColor: item.themeColor,
          left: isReversed ? 'auto' : '-10%',
          right: isReversed ? '-10%' : 'auto'
        }}
      ></div>
      
      <div className={`showcase-container ${isReversed ? 'row-reverse' : ''}`}>
        
        {/* LEFT/RIGHT: Dish Area */}
        <div className="showcase-left">
          <motion.div 
            className="showcase-dish-wrapper"
            initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
            animate={inView ? { opacity: 1, rotate: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <div className="showcase-dish-bg" style={{ backgroundColor: item.darkColor }}></div>
            
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={`dish-${imageIndex}`}
                className="showcase-dish-img-container"
                custom={direction}
                variants={dishVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <img src={item.dishImages[imageIndex]} alt={item.dishNames[imageIndex]} className="showcase-dish-img" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* CENTER: Product Area with Toggle */}
        <div className="showcase-center">
          {/* Decorative Veggies behind bottle */}
          <VeggieDecor type="tomato" style={{ width: '160px', height: '160px', top: '10%', left: '-25%', transform: isReversed ? 'scaleX(-1)' : 'none' }} />
          <VeggieDecor type="garlic" style={{ width: '120px', height: '120px', bottom: '0', right: '-20%' }} />

          <motion.div 
            className="showcase-product-wrapper"
            initial={{ opacity: 0, y: 50 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.img
                key={imageIndex}
                src={item.productImages[imageIndex]}
                alt={item.productName}
                className="showcase-product-img"
                custom={direction}
                variants={bottleVariants}
                initial="enter"
                animate="center"
                exit="exit"
              />
            </AnimatePresence>
          </motion.div>
          
          {item.productImages.length > 1 && (
            <motion.div 
              className="showcase-controls"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              style={{ justifyContent: 'center' }}
            >
              <button className="showcase-btn" onClick={handlePrevImage} style={{ backgroundColor: item.themeColor }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button className="showcase-btn" onClick={handleNextImage} style={{ backgroundColor: item.themeColor }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </motion.div>
          )}
        </div>

        {/* RIGHT/LEFT: Text Content */}
        <div className="showcase-right" style={{ paddingLeft: isReversed ? '0' : '50px', paddingRight: isReversed ? '50px' : '0', position: 'relative' }}>
          {/* Decorative Veggies behind text */}
          <VeggieDecor type="chili" style={{ width: '220px', height: '220px', top: '50%', right: '10%', transform: 'translateY(-50%) rotate(15deg)' }} />
          <VeggieDecor type="onion" style={{ width: '150px', height: '150px', bottom: '0', left: isReversed ? '60%' : '10%', transform: 'rotate(-20deg)' }} />

          <motion.div
            className="showcase-text-wrapper"
            initial={{ opacity: 0, x: isReversed ? -50 : 50 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="showcase-title">
              <span className="title-line1" style={{ color: item.themeColor }}>{item.titleLine1}</span>
              <br />
              <span className="title-line2">{item.titleLine2}</span>
            </h2>
            <p className="showcase-subtitle">{item.subtitle}</p>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default InteractiveShowcase;
