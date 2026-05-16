import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import '../styles/Recipes.css'

const Recipes = () => {
  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true })

  const recipes = [
    {
      title: "Spicy Mustard Fish Curry",
      image: "./mustard_fish_curry.png",
      oil: "Kachi Ghani Mustard Oil",
      time: "40 mins",
      difficulty: "Medium",
      desc: "Experience the authentic tang of Bengal with this classic fish curry, perfectly complemented by the pungent aroma of our pure mustard oil."
    },
    {
      title: "Crispy Golden Samosas",
      image: "./crispy_samosa.png",
      oil: "Refined Cottonseed Oil",
      time: "45 mins",
      difficulty: "Hard",
      desc: "Achieve the ultimate crispiness without the heavy oily feel. Our light cottonseed oil ensures your favorite snacks are perfectly golden."
    },
    {
      title: "Comforting Dal Tadka",
      image: "./healthy_dal.png",
      oil: "Refined Soyabean Oil",
      time: "30 mins",
      difficulty: "Easy",
      desc: "A bowl of pure comfort. A light tempering with our healthy, neutral soyabean oil lets the true flavors of spices and lentils shine."
    }
  ]

  return (
    <section className="recipes-section" id="recipes" ref={ref}>
      <motion.div
        className="section-container"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
      >
        <h2 className="section-title">
          The <span className="gold-text">Gold Mairani</span> Kitchen
        </h2>
        <p className="section-subtitle">
          Discover delicious recipes crafted perfectly for our premium oils
        </p>

        <div className="recipes-grid">
          {recipes.map((recipe, i) => (
            <motion.div
              key={i}
              className="recipe-card"
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2, duration: 0.6 }}
              whileHover={{ y: -10 }}
            >
              <div className="recipe-img-wrapper">
                <img src={recipe.image} alt={recipe.title} className="recipe-img" />
                <div className="recipe-oil-badge">{recipe.oil}</div>
              </div>
              <div className="recipe-content">
                <h3 className="recipe-title">{recipe.title}</h3>
                <p className="recipe-desc">{recipe.desc}</p>
                <div className="recipe-meta">
                  <span className="recipe-time">{recipe.time}</span>
                  <span className="recipe-difficulty">{recipe.difficulty}</span>
                </div>
                <button className="recipe-btn">View Recipe</button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

export default Recipes
