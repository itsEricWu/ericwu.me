"use client";

import { motion } from "framer-motion";
import React, { useState, useMemo } from "react";
import { BlurImage } from "./blur-image";

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

// Generate stable rotations based on index (deterministic)
function getRotation(index: number): number {
  // Use a seeded pseudo-random based on index for consistency
  const seed = (index * 9301 + 49297) % 233280;
  const random = seed / 233280;

  return (index % 2 === 0 ? 1 : -1) * ROTATION_FACTOR * random;
}

const CardStack: React.FC<CardStackProps> = ({ photos }) => {
  const initialCards = useMemo(
    () =>
      photos.map((imageUrl, index) => ({
        id: index,
        imageUrl,
        rotation: getRotation(index),
      })),
    [photos],
  );

  const [cards, setCards] = useState<Card[]>(initialCards);

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
          dragConstraints={{ top: 0, bottom: 0 }}
          initial={{ rotate: card.rotation }}
          style={{ zIndex: cards.length - index }}
          transition={{ type: "spring" as const, stiffness: 50 }}
          onDragEnd={() => moveToEnd(index)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <BlurImage
            alt="Card image"
            className="object-cover w-[80%] mx-auto md:w-full rounded-2xl aspect-video"
            containerClassName="rounded-2xl"
            height={200}
            loading={index === cards.length - 1 ? "eager" : "lazy"}
            quality={70}
            src={card.imageUrl}
            width={355}
          />
        </motion.li>
      ))}
    </ul>
  );
};

export default CardStack;
