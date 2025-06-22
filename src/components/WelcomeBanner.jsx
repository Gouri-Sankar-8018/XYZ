import { useState, useEffect } from 'react';

const WelcomeBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Welcome to GarmentsPro",
      subtitle: "Smart Business Solutions",
      description: "Manage your garment business efficiently",
      bgGradient: "from-blue-800 via-sky-200 to-indigo-100",
      image: "https://i.pinimg.com/originals/ec/6c/5a/ec6c5ab94ee1ee6c3a2a4fb9d56843e2.jpg?auto=format&fit=crop&w=800",
      
      stats: { orders: "150+", products: "1.2k+", customers: "800+" }
    },
    {
      title: "New Arrivals",
      subtitle: "Summer Collection 2024",
      description: "Fresh styles added to inventory",
      bgGradient: "from-emerald-800 via-emerald-200 to-teal-100",
      image: "https://cdn.mainlinemenswear.co.uk/image/upload/w_930/q_100/v1658490551/homesliders/usipkbpzieqbwgkoplte.jpg?auto=format&fit=crop&w=800",
      stats: { styles: "50+", colors: "25+", sizes: "XS-3XL" }
    },
    {
      title: "Top Selling Products",
      subtitle: "Trending Now",
      description: "See what's popular this season",
      bgGradient: "from-red-800 via-rose-200 to-pink-100",
      image: "https://img.ltwebstatic.com/images3_ach/2022/09/19/166357578553460563760f1535bd271475f51fa9e5.jpg?auto=format&fit=crop&w=800",
      stats: { sales: "2.5k+", rating: "4.8★", reviews: "500+" }
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-[300px] overflow-hidden rounded-2xl shadow-2xl">
      <div 
        className="relative flex transition-transform duration-700 ease-out h-full" 
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`w-full flex-shrink-0 relative overflow-hidden bg-gradient-to-r ${slide.bgGradient}`}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-pattern animate-slide"></div>
            </div>

            {/* Content Container */}
            <div className="relative h-full flex items-center px-8 py-6">
              {/* Text Content */}
              <div className="w-1/2 pr-8 space-y-4 transform transition-all duration-700 delay-100"
                   style={{ opacity: currentSlide === index ? 1 : 0, transform: `translateY(${currentSlide === index ? '0' : '20px'})` }}>
                <h3 className="text-white/80 text-lg font-medium">{slide.subtitle}</h3>
                <h2 className="text-white text-3xl font-bold leading-tight">{slide.title}</h2>
                <p className="text-white/90">{slide.description}</p>

                {/* Stats */}
                <div className="flex gap-6 pt-4">
                  {Object.entries(slide.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-white text-xl font-bold">{value}</div>
                      <div className="text-white/70 text-sm">{key}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="absolute right-0 top-0 w-1/2 h-full">
                <div className="relative h-full transform transition-all duration-700 delay-200"
                     style={{ opacity: currentSlide === index ? 1 : 0, transform: `translateX(${currentSlide === index ? '0' : '50px'})` }}>
                  <img 
                    src={slide.image} 
                    alt={slide.title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0% 100%)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-4 left-8 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all duration-500 backdrop-blur-sm
              ${index === currentSlide 
                ? 'w-8 bg-white shadow-lg' 
                : 'w-2 bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default WelcomeBanner;
