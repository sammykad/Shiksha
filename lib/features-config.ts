/**
 * Features Configuration for Internal Linking
 * Defines relationships between features, industries, and use cases
 */

export interface FeatureConfig {
  slug: string;
  name: string;
  description: string;
  relatedFeatures: string[];
  relatedIndustries: string[];
  primaryUseCase: string;
  icon: string;
}

export const FEATURES: Record<string, FeatureConfig> = {
  'student-management': {
    slug: 'student-management',
    name: 'Student Management',
    description: 'Complete student lifecycle management from admission to alumni',
    relatedFeatures: ['attendance', 'exam-management', 'document-verification'],
    relatedIndustries: ['k-12-schools', 'colleges-higher-education', 'coaching-centers'],
    primaryUseCase: 'Track student information, admissions, and academic progress',
    icon: 'Users',
  },
  'attendance': {
    slug: 'attendance',
    name: 'Attendance Tracking',
    description: '2-tap attendance with real-time parent notifications',
    relatedFeatures: ['notification-engine', 'student-management', 'ai-reports'],
    relatedIndustries: ['k-12-schools', 'pre-schools', 'coaching-centers'],
    primaryUseCase: 'Automate attendance tracking and parent communication',
    icon: 'Clock',
  },
  'fee-management': {
    slug: 'fee-management',
    name: 'Fee Management',
    description: 'Online fee collection with automated receipts and reminders',
    relatedFeatures: ['notification-engine', 'ai-reports', 'integration'],
    relatedIndustries: ['k-12-schools', 'colleges-higher-education', 'professional-institutes'],
    primaryUseCase: 'Streamline fee collection and payment tracking',
    icon: 'CreditCard',
  },
  'exam-management': {
    slug: 'exam-management',
    name: 'Exam Management',
    description: 'Complete exam scheduling, grading, and result processing',
    relatedFeatures: ['student-management', 'ai-reports', 'notification-engine'],
    relatedIndustries: ['k-12-schools', 'colleges-higher-education', 'coaching-centers'],
    primaryUseCase: 'Manage exams, grades, and performance reports',
    icon: 'FileText',
  },
  'notification-engine': {
    slug: 'notification-engine',
    name: 'Notification Engine',
    description: 'Multi-channel notifications via WhatsApp, SMS, email, and push',
    relatedFeatures: ['attendance', 'fee-management', 'holidays'],
    relatedIndustries: ['k-12-schools', 'colleges-higher-education', 'coaching-centers'],
    primaryUseCase: 'Instant communication with parents, students, and staff',
    icon: 'Bell',
  },
  'document-verification': {
    slug: 'document-verification',
    name: 'Document Verification',
    description: 'Digital document management with verification workflow',
    relatedFeatures: ['student-management', 'lead-management'],
    relatedIndustries: ['k-12-schools', 'colleges-higher-education', 'professional-institutes'],
    primaryUseCase: 'Secure document storage and verification',
    icon: 'FileCheck',
  },
  'holidays': {
    slug: 'holidays',
    name: 'Holiday Management',
    description: 'Manage holidays, events, and calendar scheduling',
    relatedFeatures: ['attendance', 'notification-engine', 'exam-management'],
    relatedIndustries: ['k-12-schools', 'pre-schools', 'coaching-centers'],
    primaryUseCase: 'Centralized calendar and holiday management',
    icon: 'Calendar',
  },
  'ai-reports': {
    slug: 'ai-reports',
    name: 'AI Reports',
    description: 'Intelligent analytics and automated report generation',
    relatedFeatures: ['student-management', 'attendance', 'fee-management'],
    relatedIndustries: ['k-12-schools', 'colleges-higher-education', 'coaching-centers'],
    primaryUseCase: 'Data-driven insights and automated reporting',
    icon: 'BarChart3',
  },
  'lead-management': {
    slug: 'lead-management',
    name: 'Lead Management',
    description: 'Track inquiries and convert prospects to students',
    relatedFeatures: ['document-verification', 'notification-engine'],
    relatedIndustries: ['k-12-schools', 'coaching-centers', 'professional-institutes'],
    primaryUseCase: 'Admission funnel management and conversion',
    icon: 'Target',
  },
  'integration': {
    slug: 'integration',
    name: 'Integrations',
    description: 'Connect with Facebook, Google Sheets, WhatsApp, and more',
    relatedFeatures: ['notification-engine', 'fee-management'],
    relatedIndustries: ['k-12-schools', 'colleges-higher-education', 'coaching-centers'],
    primaryUseCase: 'Seamless integration with existing tools',
    icon: 'Plug',
  },
  'anonymous-complaints': {
    slug: 'anonymous-complaints',
    name: 'Anonymous Complaints',
    description: 'Safe, anonymous reporting system for students and parents',
    relatedFeatures: ['notification-engine'],
    relatedIndustries: ['k-12-schools', 'colleges-higher-education'],
    primaryUseCase: 'Student safety and grievance redressal',
    icon: 'Shield',
  },
  'by-role': {
    slug: 'by-role',
    name: 'Role-Based Access',
    description: 'Customized dashboards for admin, teacher, student, and parent',
    relatedFeatures: ['student-management', 'attendance', 'notification-engine'],
    relatedIndustries: ['k-12-schools', 'colleges-higher-education', 'coaching-centers'],
    primaryUseCase: 'Personalized experience for each user role',
    icon: 'Users',
  },
};

/**
 * Get related features for a given feature slug
 */
export function getRelatedFeatures(slug: string, limit: number = 3): FeatureConfig[] {
  const feature = FEATURES[slug];
  if (!feature) return [];

  return feature.relatedFeatures
    .slice(0, limit)
    .map((relatedSlug) => FEATURES[relatedSlug])
    .filter(Boolean);
}

/**
 * Get features by industry
 */
export function getFeaturesByIndustry(industrySlug: string): FeatureConfig[] {
  return Object.values(FEATURES).filter((feature) =>
    feature.relatedIndustries.includes(industrySlug)
  );
}

/**
 * Get all features for features hub page
 */
export function getAllFeatures(): FeatureConfig[] {
  return Object.values(FEATURES);
}
