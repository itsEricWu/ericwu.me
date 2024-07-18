import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import Image from "next/image";

const CARD_OFFSET = 4;
const ROTATION_FACTOR = 6;

interface Card {
  id: number;
  imageUrl: string;
  rotation: number;
}

interface CardStackProps {
  photos: string[];
}

const CardStack: React.FC<CardStackProps> = ({ photos }) => {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    if (photos.length > 0) {
      const initialCards = photos.map((imageUrl, index) => ({
        id: index,
        imageUrl: imageUrl,
        rotation: (index % 2 === 0 ? 1 : -1) * ROTATION_FACTOR * Math.random(),
      }));

      setCards(initialCards);
    }
  }, [photos]);

  const moveToEnd = (from: number) => {
    setCards((prevCards) => {
      const newCards = [...prevCards];
      const item = newCards.splice(from, 1)[0];

      newCards.push(item);

      return newCards;
    });
  };

  return (
    <ul className="h-full w-full flex justify-center items-center mt-4">
      {cards.map((card, index) => (
        <motion.li
          key={card.id}
          animate={{
            y: index * -CARD_OFFSET,
            rotate: card.rotation,
          }}
          className="absolute origin-center list-none rounded-lg cursor-grab"
          drag="y"
          dragConstraints={{
            top: 0,
            bottom: 0,
          }}
          initial={{ rotate: card.rotation }}
          style={{
            zIndex: cards.length - index,
          }}
          transition={{ type: "spring", stiffness: 50 }}
          onDragEnd={() => moveToEnd(index)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Image
            alt="Card image"
            className="object-cover w-[80%] mx-auto md:w-full rounded-2xl aspect-video"
            height={200}
            src={card.imageUrl}
            width={355}
          />
        </motion.li>
      ))}
    </ul>
  );
};

export default CardStack;
