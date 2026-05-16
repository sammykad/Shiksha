export type OrganizationLike = {
    id: string;
    name: string;
    slug?: string | null;
    logo?: string | null;
    role?: string | null;
};

export type OrgInvitation = {
    id: string;
    organizationId: string;
    organizationName: string;
    organizationLogo?: string | null;
    role: string;
    status: string;
};

export type OrgSuggestion = {
    id: string;
    organizationId: string;
    organizationName: string;
    organizationLogo?: string | null;
};
