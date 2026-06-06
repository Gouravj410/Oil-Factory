import React from 'react';
import './PackSizesMarquee.css';

const PackSizesMarquee = () => {
  const products = [
    {
      name: "Mustard Oil",
      variants: [
        { size: "1L", img: "./images/mustard400.png", imgClass: "size-small" },
        { size: "5L", img: "./images/mustard400.png", imgClass: "size-medium" },
        { size: "15L", img: "./images/MustardOilCan.png", imgClass: "size-large" }
      ]
    },
    {
      name: "Soyabean Oil",
      variants: [
        { size: "1L", img: "./images/soyabean400.png", imgClass: "size-small" },
        { size: "5L", img: "./images/soyabean400.png", imgClass: "size-medium" },
        { size: "15L", img: "./images/SoyaBeansOilCan.png", imgClass: "size-large" }
      ]
    },
    {
      name: "Cottonseed Oil",
      variants: [
        { size: "1L", img: "./images/cottonseed400.png", imgClass: "size-small" },
        { size: "5L", img: "./images/cottonseed850.png", imgClass: "size-medium" },
        { size: "15L", img: "./images/cottonseed850.png", imgClass: "size-large" }
      ]
    }
  ];

  // Duplicate items to create infinite scroll effect
  const displayItems = [...products, ...products, ...products, ...products];

  return (
    <div className="pack-sizes-container">
      <div className="pack-sizes-label">AVAILABLE IN:</div>
      <div className="marquee-wrapper">
        <div className="marquee-content">
          {displayItems.map((product, idx) => (
            <div key={idx} className="marquee-item">
              <span className="product-name">{product.name}</span>
              <div className="product-variants">
                {product.variants.map((v, i) => (
                  <div key={i} className="variant-item">
                    <img src={v.img} alt={`${product.name} ${v.size}`} className={`variant-img ${v.imgClass}`} />
                    <span className="variant-size">{v.size}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PackSizesMarquee;
