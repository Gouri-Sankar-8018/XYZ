import { useState, useEffect } from 'react';

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    
    {
      url: 'https://i.pinimg.com/originals/b8/ce/12/b8ce12af4e594bcb26b8f55b0377dad4.jpg',
      title: 'Spring Fashion'
    },
    {
      url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04',
      title: 'Summer Styles'
    },
    {
      url: 'https://www.meenabazaar.shop/cdn/shop/articles/winter_banner.jpg?v=1668159789&width=1500',
      title: 'Winter Collection'
    },
    {
      url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e',
      title: 'Formal Wear'
    },
    {
      url: 'https://marketplace.canva.com/EAFGKRRskMs/1/0/1600w/canva-brown-and-beige-minimalist-fashion-banner-lYcbGpUSVGo.jpg',
      title: 'Casual Outfits'
    },
    {
      url: 'https://i.pinimg.com/originals/fa/b9/ec/fab9ecd3d3b39a7ee39ef3e87e083713.png',
      title: 'Party Dresses'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="relative h-[300px] overflow-hidden rounded-lg">
      {images.map((image, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-all duration-500 ease-in-out transform
            ${index === currentIndex ? 'translate-x-0' : 'translate-x-full'}`}
          style={{
            transform: `translateX(${100 * (index - currentIndex)}%)`
          }}
        >
          <img
            src={image.url}
            alt={image.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h4 className="text-white font-semibold">{image.title}</h4>
          </div>
        </div>
      ))}
      
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
      >
        <i className="fa-solid fa-chevron-left"></i>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
      >
        <i className="fa-solid fa-chevron-right"></i>
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all
              ${index === currentIndex ? 'bg-white w-4' : 'bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
