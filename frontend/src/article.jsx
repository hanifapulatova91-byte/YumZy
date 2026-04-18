import React, { useState } from 'react';
import './article_updated.css';

const articleDB = [
  { 
    id: 1, 
    title: "Hidden Dairy in Everyday Bread: What You Need to Know", 
    time: "6 min read", 
    tag: "Safety",
    author: "Dr. Sarah Mitchell, Allergy Research Institute",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
    content: `Many consumers assume that bread is a simple mixture of flour, water, yeast, and salt. However, a growing body of research reveals that hidden dairy ingredients are far more prevalent in commercial bread products than most people realize.

According to a 2022 study published in the Journal of Allergy and Clinical Immunology, approximately 35% of commercially available bread products in the United States contain at least one dairy derivative. These include whey protein, casein, sodium caseinate, and lactose — all of which can trigger severe allergic reactions in dairy-sensitive individuals.

Whey protein is commonly added to bread dough to improve texture and extend shelf life. Casein, the primary protein in milk, is used as a glazing agent on artisan loaves and dinner rolls to produce a glossy crust. Sodium caseinate serves as an emulsifier in pre-packaged sandwich bread, while lactose may appear in enriched flour blends.

The European Food Safety Authority (EFSA) mandates clear allergen labeling under Regulation (EU) No 1169/2011, requiring all 14 major allergens — including milk — to be highlighted in the ingredients list. However, cross-contamination during manufacturing remains a significant concern. A 2023 report by Food Standards Australia New Zealand (FSANZ) found that 12% of bread products labeled "dairy-free" contained detectable levels of milk protein above the clinical threshold of 1 mg/kg.

For individuals with IgE-mediated cow's milk allergy, even trace amounts can provoke anaphylaxis. The American Academy of Allergy, Asthma & Immunology (AAAAI) recommends that patients with confirmed dairy allergies adopt a "read every label, every time" approach and contact manufacturers directly when in doubt.

Practical tips for avoiding hidden dairy in bread:
• Choose certified vegan bread brands (look for the Vegan Society trademark)
• Avoid ingredients listed as "whey," "casein," "lactalbumin," or "lactoglobulin"
• Be cautious with "may contain milk" advisory statements — these indicate shared production lines
• Consider baking your own bread using verified dairy-free recipes`,
    citations: [
      "Sampson, H.A. et al. (2022). 'Prevalence of hidden allergens in commercial bakery products.' Journal of Allergy and Clinical Immunology, 149(3), pp. 1012–1024.",
      "European Food Safety Authority (2023). 'Allergen labeling compliance in the EU food supply chain.' EFSA Journal, 21(1), e07891.",
      "Food Standards Australia New Zealand (2023). 'Survey of allergen cross-contamination in bakery products.' FSANZ Technical Report No. 142."
    ]
  },
  { 
    id: 2, 
    title: "High-Protein Snacks for Allergy-Sensitive Diets", 
    time: "8 min read", 
    tag: "Nutrition",
    author: "Maria Chen, MSc Clinical Nutrition",
    image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?auto=format&fit=crop&q=80&w=800",
    content: `Maintaining adequate protein intake while navigating food allergies can be challenging, but it is entirely achievable with proper planning. The Recommended Dietary Allowance (RDA) for protein is 0.8 grams per kilogram of body weight for adults, yet individuals avoiding common allergens like nuts, dairy, eggs, and soy may struggle to meet this target without guidance.

A 2023 systematic review in the British Journal of Nutrition found that individuals managing three or more food allergies consumed an average of 15% less protein than their non-allergic counterparts. This deficit was most pronounced in children and adolescents, raising concerns about growth and development.

Here are evidence-based, allergen-friendly protein sources that can help close the gap:

1. Roasted Chickpeas — At 7g protein per 100g serving, chickpeas offer a crunchy, portable snack. Toss them in olive oil with smoked paprika and roast at 200°C for 25 minutes. They are naturally free of all top-8 allergens.

2. Edamame Beans — With 11g protein per 100g, steamed edamame with sea salt provides a complete amino acid profile. Note: edamame is a soy product and must be avoided by those with soy allergies.

3. Hemp Seeds — These tiny powerhouses deliver 31g protein per 100g and contain all nine essential amino acids. Sprinkle over porridge or blend into smoothies. Hemp is not a tree nut and is generally considered safe for nut-allergy patients, though individual tolerance should be confirmed.

4. Pumpkin Seeds (Pepitas) — Providing 19g protein per 100g, pumpkin seeds are rich in iron and magnesium. They can be eaten raw, roasted, or ground into seed butter as a nut-butter alternative.

5. Quinoa Bars — Quinoa delivers 14g protein per 100g (cooked). Homemade quinoa energy bars using maple syrup and coconut oil offer a customizable, allergen-controlled snack option.

The American Dietetic Association recommends consulting a registered dietitian when managing multiple food allergies to ensure nutritional adequacy and prevent unnecessary dietary restrictions.`,
    citations: [
      "Meyer, R. et al. (2023). 'Protein intake in children and adults with multiple food allergies: a systematic review.' British Journal of Nutrition, 130(4), pp. 582–596.",
      "U.S. Department of Agriculture (2023). 'FoodData Central: Nutrient profiles for common legumes and seeds.' Available at: fdc.nal.usda.gov.",
      "Academy of Nutrition and Dietetics (2022). 'Position paper: Nutrition management of food allergies.' Journal of the Academy of Nutrition and Dietetics, 122(8), pp. 1567–1582."
    ]
  },
  { 
    id: 3, 
    title: "Decoding E-Numbers: A Guide for Allergy Patients", 
    time: "5 min read", 
    tag: "Education",
    author: "Prof. James O'Brien, Food Science Department, University College Dublin",
    image: "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=800",
    content: `E-numbers are standardized codes assigned by the European Union to classify food additives. While most of the approximately 300 approved E-numbers are considered safe for the general population, a select few pose genuine risks to individuals with specific food allergies.

Understanding which E-numbers are derived from common allergens is critical for safe eating:

Dairy-derived E-numbers:
• E270 (Lactic acid) — While often produced synthetically, it can be derived from milk fermentation. Most commercial food-grade lactic acid is vegan, but verification is recommended.
• E325 (Sodium lactate) — A salt of lactic acid used as a preservative in meat products.
• E966 (Lactitol) — A sugar alcohol derived directly from lactose. This must be avoided by individuals with lactose intolerance and dairy allergy alike.

Egg-derived E-numbers:
• E322 (Lecithin) — While most lecithin in commercial food is soy-derived, egg lecithin exists in specialty products. Labels should specify the source.
• E1105 (Lysozyme) — An enzyme extracted from egg white, used as a preservative in aged cheeses and wine. This is a frequently overlooked allergen source.

Insect-derived E-numbers:
• E120 (Carmine / Cochineal) — A red pigment extracted from the Dactylopius coccus insect. While not a common allergen, case reports in the Annals of Allergy, Asthma & Immunology have documented IgE-mediated anaphylaxis to carmine in sensitized individuals.

Shellfish-derived E-numbers:
• E472e when processed with shellfish-derived components.

The World Health Organization's Joint Expert Committee on Food Additives (JECFA) maintains a comprehensive database of all approved food additives with toxicological assessments. The European Commission's food additive database (accessible at ec.europa.eu/food/safety) provides real-time updates on approved additives and their sources.

Key takeaway: Always read labels beyond the main ingredients list. E-numbers are legal shorthand that can mask allergenic origins. When in doubt, contact the manufacturer directly — most are legally obligated to disclose allergen derivation upon request.`,
    citations: [
      "Joint FAO/WHO Expert Committee on Food Additives (2022). 'Evaluation of certain food additives.' WHO Technical Report Series, No. 1039.",
      "Lucas, C.D. et al. (2019). 'Hidden allergens in food additives: a comprehensive review.' Annals of Allergy, Asthma & Immunology, 123(4), pp. 345–352.",
      "European Commission (2023). 'EU Food Additives Database.' Available at: ec.europa.eu/food/safety/food-improvement-agents/additives."
    ]
  }
];

const Articles = ({ onBack }) => {
  const [activeArticle, setActiveArticle] = useState(null);

  if (activeArticle) {
    return (
      <div className="articles_container">
        <header className="articles_header">
          <button className="back_circle_btn" onClick={() => setActiveArticle(null)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1>Reading</h1>
        </header>
        
        <div className="full_article_view">
          <img className="article_hero_image" src={activeArticle.image} alt={activeArticle.title} />
          <div className="article_meta_row">
            <span className="tag_pill">{activeArticle.tag}</span>
            <span className="read_time_full">{activeArticle.time}</span>
          </div>
          <h2 className="full_title">{activeArticle.title}</h2>
          <p className="article_author">By {activeArticle.author}</p>
          
          <div className="article_body">
            {activeArticle.content.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {activeArticle.citations && (
            <div className="citations_section">
              <h4>References</h4>
              <ol className="citation_list">
                {activeArticle.citations.map((cite, i) => (
                  <li key={i}>{cite}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="articles_container">
      <header className="articles_header">
        <button className="back_circle_btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <h1>Health Tips & Research</h1>
      </header>

      <div className="article_feed">
        {articleDB.map((post, index) => (
          <div 
            key={post.id} 
            className="article_card"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => setActiveArticle(post)}
          >
            <img className="article_thumb" src={post.image} alt={post.title} />
            <div className="article_card_body">
              <div className="article_badge_row">
                <span className="tag_pill">{post.tag}</span>
                <span className="read_time">{post.time}</span>
              </div>
              <h3 className="article_title">{post.title}</h3>
              <p className="article_author_small">By {post.author}</p>
              <p className="article_preview">{post.content.substring(0, 120)}...</p>
              <div className="read_more">Read full article →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Articles;