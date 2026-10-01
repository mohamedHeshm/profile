export interface Profile { id: string; full_name: string; username: string | null; job_title: string; short_bio: string; full_bio: string; location: string; email: string; avatar_url: string | null; years_experience: number | null; available: boolean }
export interface Skill { id: string; owner_id: string; name: string; category: string; featured: boolean; visible: boolean; sort_order: number }
export interface Project { id: string; owner_id: string; title: string; summary: string; description: string; image_url: string | null; technologies: string[]; github_url: string | null; live_url: string | null; featured: boolean; published: boolean; sort_order: number; role: string; challenges: string; solutions: string; results: string }
export interface Experience { id: string; company: string; position: string; location: string; start_date: string | null; end_date: string | null; current: boolean; description: string }
export interface Education { id: string; institution: string; degree: string; field: string; start_date: string | null; end_date: string | null; description: string }
export interface Service { id: string; title: string; description: string }
export interface SocialLink { id: string; platform: string; url: string }
export interface PortfolioSettings { site_title: string; accent: string; section_order: string[]; hidden_sections: string[]; hero_text: string; logo_url: string | null; favicon_url: string | null }
