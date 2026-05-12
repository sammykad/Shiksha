/**
 * ADD NEW POSTS HERE
 * ==================
 * 1. Create your post file in this same folder
 * 2. Import it below and add it to the array
 */

import type { BlogPost } from '../blog-types';

import aiSchoolAdmin from './ai-school-administration-2026';
import whyIndianSchools from './why-indian-schools-choosing-shiksha-cloud';
import technologyBehind from './technology-behind-shiksha-cloud';
import transparencyBridging from './transparency-bridging-schools-parents';
import feeCollection from './how-to-improve-fee-collection-indian-schools';
import attendanceTracking from './attendance-tracking-reduces-dropout-rates';
import switchingFromExcel from './switching-from-excel-to-school-management-software';

const blogPosts: BlogPost[] = [
  aiSchoolAdmin,
  whyIndianSchools,
  technologyBehind,
  transparencyBridging,
  feeCollection,
  attendanceTracking,
  switchingFromExcel,
];

export default blogPosts;