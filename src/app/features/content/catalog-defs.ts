import {
  Baby,
  Briefcase,
  Building2,
  GraduationCap,
  Heart,
  Languages,
  MapPin,
  Sparkles,
  Church,
} from 'lucide-angular';
import type { CatalogDef } from '../../models/content.model';

/** Catalogues éditables du Sprint A6, dans l'ordre d'affichage. */
export const CATALOG_DEFS: CatalogDef[] = [
  {
    key: 'interests',
    label: "Centres d'intérêt",
    singular: 'intérêt',
    icon: Sparkles,
    extraFields: [{ name: 'icon', label: 'Icône', type: 'text', optional: true }],
  },
  {
    key: 'languages',
    label: 'Langues',
    singular: 'langue',
    icon: Languages,
    extraFields: [],
  },
  {
    key: 'religions',
    label: 'Religions',
    singular: 'religion',
    icon: Church,
    extraFields: [],
  },
  {
    key: 'relationship_goals',
    label: 'Objectifs de relation',
    singular: 'objectif',
    icon: Heart,
    extraFields: [{ name: 'subtitle', label: 'Sous-titre', type: 'text', optional: true }],
  },
  {
    key: 'occupations',
    label: 'Professions',
    singular: 'profession',
    icon: Briefcase,
    extraFields: [],
  },
  {
    key: 'education_levels',
    label: "Niveaux d'études",
    singular: 'niveau',
    icon: GraduationCap,
    extraFields: [],
  },
  {
    key: 'lifestyle_options',
    label: 'Style de vie',
    singular: 'option',
    icon: Baby,
    extraFields: [{ name: 'category', label: 'Catégorie', type: 'text' }],
  },
  {
    key: 'countries',
    label: 'Pays',
    singular: 'pays',
    icon: MapPin,
    extraFields: [{ name: 'emoji', label: 'Drapeau', type: 'emoji', optional: true }],
  },
  {
    key: 'cities',
    label: 'Villes',
    singular: 'ville',
    icon: Building2,
    extraFields: [{ name: 'country_key', label: 'Code pays', type: 'text' }],
  },
];
