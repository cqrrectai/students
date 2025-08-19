"use client";
import React from "react";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "Cqrrect AI helped me ace my BCS preliminary exam. The AI-generated questions were spot-on with the actual exam pattern!",
    image: "/placeholder-user.jpg",
    name: "Tasnim Rahman",
    role: "BCS Aspirant",
  },
  {
    text: "As a medical student, the MBBS practice questions on Cqrrect AI were invaluable. The AI proctor made me more confident for my exams.",
    image: "/placeholder-user.jpg",
    name: "Fahim Ahmed",
    role: "Medical Student",
  },
  {
    text: "The university admission test preparation on Cqrrect AI is outstanding. The personalized feedback helped me improve rapidly.",
    image: "/placeholder-user.jpg",
    name: "Nusrat Jahan",
    role: "University Student",
  },
  {
    text: "Bank job preparation became so much easier with Cqrrect AI. The practice tests are exactly like the real ones!",
    image: "/placeholder-user.jpg",
    name: "Rakib Hasan",
    role: "Bank Job Aspirant",
  },
  {
    text: "The HSC practice exams on Cqrrect AI boosted my confidence. The AI explanations are clear and helpful.",
    image: "/placeholder-user.jpg",
    name: "Samia Akter",
    role: "HSC Student",
  },
  {
    text: "As a teacher, I recommend Cqrrect AI to all my students. It's revolutionizing exam preparation in Bangladesh.",
    image: "/placeholder-user.jpg",
    name: "Mohammad Karim",
    role: "Education Professional",
  },
  {
    text: "The primary teacher recruitment exam practice on Cqrrect AI was excellent. Helped me secure my position!",
    image: "/placeholder-user.jpg",
    name: "Sharmin Sultana",
    role: "Primary Teacher",
  },
  {
    text: "SSC preparation became systematic with Cqrrect AI. The progress tracking feature is amazing!",
    image: "/placeholder-user.jpg",
    name: "Imran Khan",
    role: "SSC Student",
  },
  {
    text: "The NTRCA exam preparation module is comprehensive. The AI-powered mock tests are game-changing.",
    image: "/placeholder-user.jpg",
    name: "Farhana Begum",
    role: "Teaching Aspirant",
  },
];

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div 
                  className="p-6 rounded-xl border border-[#00e4a0]/20 shadow-lg shadow-[#00e4a0]/5 max-w-xs w-full bg-gray-900/80 backdrop-blur-sm" 
                  key={i}
                >
                  <div className="text-sm text-gray-300">{text}</div>
                  <div className="flex items-center gap-2 mt-4">
                    <img
                      width={32}
                      height={32}
                      src={image}
                      alt={name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="flex flex-col">
                      <div className="font-medium tracking-tight leading-4 text-sm text-[#00e4a0]">{name}</div>
                      <div className="leading-4 tracking-tight text-xs text-gray-400">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

export const Testimonials = () => {
  return (
    <section className="bg-gray-950 relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950"></div>
      
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border border-[#00e4a0]/20 py-1 px-4 rounded-lg text-[#00e4a0] text-sm bg-gray-900/50">
              Success Stories
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold tracking-tighter mt-5 text-center text-white">
            Join Thousands of Successful Students
          </h2>
          <p className="text-center mt-4 text-gray-300 text-sm md:text-base">
            See how Cqrrect AI is transforming exam preparation across Bangladesh
          </p>
        </motion.div>

        <div className="flex justify-center gap-4 md:gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[640px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
}; 