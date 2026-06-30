'use client';
import { motion } from 'motion/react';
import InstituteAvatarPopover from '@/components/website/shared/InstituteAvatarPopover';
import { institutes } from '@/constants';
import { Globe } from '@/components/ui/globe';

const AVATAR_PATHS = [
  '/indian-avatars/female-1.png',
  '/indian-avatars/female-2.png',
  '/indian-avatars/female-3.png',
  '/indian-avatars/female-4.png',
  '/indian-avatars/female-5.png',
  '/indian-avatars/female-6.png',
  '/indian-avatars/female-7.png',
  '/indian-avatars/female-8.png',
  '/indian-avatars/female-9.png',
  '/indian-avatars/female-10.png',
  '/indian-avatars/male-1.png',
  '/indian-avatars/male-2.png',
  '/indian-avatars/male-3.png',
  '/indian-avatars/male-4.png',
  '/indian-avatars/male-5.png',
  '/indian-avatars/male-6.png',
  '/indian-avatars/male-7.png',
];

const DUPLICATE_IDS = new Set([
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42,
]);

let avatarIndex = 0;
const institutesWithAvatars = institutes.map((inst) => {
  if (DUPLICATE_IDS.has(inst.id)) {
    const image = AVATAR_PATHS[avatarIndex % AVATAR_PATHS.length];
    avatarIndex++;
    return { ...inst, image };
  }
  return inst;
});

const InstitutesShowcase = () => {
  return (
    <div className="text-center py-4 px-4 relative overflow-hidden">
      {/* Responsive Globe */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[700px] lg:h-[700px] rounded-full z-50">
        <Globe className="top-26 z-50 absolute" />
      </div>

      {/* Tablet & Desktop Layout */}
      <div className="lg:grid grid-cols-7 max-w-7xl mx-auto">
        {/* Row 1 */}
        <div className="col-span-7 flex justify-between ">
          {institutesWithAvatars.slice(0, 22).map((institute) => (
            <motion.div
              key={institute.id}
              className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
            >
              <InstituteAvatarPopover institute={institute} />
            </motion.div>
          ))}
        </div>

        {/* Row 2 */}
        <div className="col-span-7 flex justify-between ">
          {institutesWithAvatars.slice(23, 40).map((institute) => (
            <motion.div
              key={institute.id}
              className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
            >
              <InstituteAvatarPopover institute={institute} />
            </motion.div>
          ))}
        </div>

        {/* Row 3 */}
        <div className="col-span-7 flex justify-items-end">
          {institutesWithAvatars.slice(41, 64).map((institute) => (
            <motion.div
              key={institute.id}
              className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
            >
              <InstituteAvatarPopover institute={institute} />
            </motion.div>
          ))}
        </div>

        {/* Row 4 */}
        <div className="col-span-7 flex justify-between">
          {institutesWithAvatars.slice(65, 83).map((institute) => (
            <motion.div
              key={institute.id}
              className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
            >
              <InstituteAvatarPopover institute={institute} />
            </motion.div>
          ))}
        </div>

        {/* Row 5 */}
        <div className="col-span-7 flex justify-between">
          {institutesWithAvatars.slice(84, 101).map((institute) => (
            <motion.div
              key={institute.id}
              className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
            >
              <InstituteAvatarPopover institute={institute} />
            </motion.div>
          ))}
        </div>

        {/* Row 6 */}
        <div className="col-span-7 flex justify-between">
          <div className="flex justify-between w-full">
            <div className="flex">
              {institutesWithAvatars.slice(101, 108).map((institute) => (
                <motion.div
                  key={institute.id}
                  className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
                >
                  <InstituteAvatarPopover institute={institute} />
                </motion.div>
              ))}
            </div>
            <div className="flex">
              {institutesWithAvatars.slice(109, 116).map((institute) => (
                <motion.div
                  key={institute.id}
                  className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
                >
                  <InstituteAvatarPopover institute={institute} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 7 */}
        <div className="col-span-7 flex justify-between">
          <div className="flex justify-between w-full">
            <div className="flex">
              {institutesWithAvatars.slice(50, 55).map((institute) => (
                <motion.div
                  key={institute.id}
                  className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
                >
                  <InstituteAvatarPopover institute={institute} />
                </motion.div>
              ))}
            </div>
            <div className="flex">
              {institutesWithAvatars.slice(55, 60).map((institute) => (
                <motion.div
                  key={institute.id}
                  className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
                >
                  <InstituteAvatarPopover institute={institute} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 8 */}
        <div className="col-span-7 flex justify-between">
          <div className="flex justify-between w-full">
            <div className="flex">
              {institutesWithAvatars.slice(50, 54).map((institute) => (
                <motion.div
                  key={institute.id}
                  className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
                >
                  <InstituteAvatarPopover institute={institute} />
                </motion.div>
              ))}
            </div>
            <div className="flex">
              {institutesWithAvatars.slice(55, 60).map((institute) => (
                <motion.div
                  key={institute.id}
                  className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
                >
                  <InstituteAvatarPopover institute={institute} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 9 */}
        <div className="col-span-7 flex justify-between">
          <div className="flex justify-between w-full">
            <div className="flex">
              {institutesWithAvatars.slice(50, 52).map((institute) => (
                <motion.div
                  key={institute.id}
                  className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
                >
                  <InstituteAvatarPopover institute={institute} />
                </motion.div>
              ))}
            </div>
            <div className="flex">
              {institutesWithAvatars.slice(58, 61).map((institute) => (
                <motion.div
                  key={institute.id}
                  className="w-16 h-16 flex transition-opacity duration-300 ease-in-out"
                >
                  <InstituteAvatarPopover institute={institute} />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutesShowcase;
