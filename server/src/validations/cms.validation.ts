export interface PackageInput {
  name: string;
  badge: string;
  desc: string;
  price: number;
  color?: string;
  accent?: string;
  features: string; // JSON string of features, e.g. '[{"name": "...", "included": true}]'
}

export function validatePackageInput(input: any): { error?: string; value?: PackageInput } {
  const { name, badge, desc, price, color, accent, features } = input;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { error: 'Package name is required.' };
  }
  if (!badge || typeof badge !== 'string' || !badge.trim()) {
    return { error: 'Package badge is required.' };
  }
  if (!desc || typeof desc !== 'string' || !desc.trim()) {
    return { error: 'Package description is required.' };
  }
  const parsedPrice = Number(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    return { error: 'Valid positive price is required.' };
  }
  if (!features || typeof features !== 'string') {
    return { error: 'Features list is required (must be a valid JSON string).' };
  }
  try {
    const parsedFeatures = JSON.parse(features);
    if (!Array.isArray(parsedFeatures)) {
      return { error: 'Features must be a JSON array.' };
    }
  } catch (err) {
    return { error: 'Features must be a valid JSON string.' };
  }

  return {
    value: {
      name: name.trim(),
      badge: badge.trim(),
      desc: desc.trim(),
      price: parsedPrice,
      color: color ? String(color).trim() : undefined,
      accent: accent ? String(accent).trim() : undefined,
      features: features.trim(),
    },
  };
}

export interface ServiceInput {
  title: string;
  desc: string;
  image: string;
  iconName: string;
}

export function validateServiceInput(input: any): { error?: string; value?: ServiceInput } {
  const { title, desc, image, iconName } = input;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return { error: 'Service title is required.' };
  }
  if (!desc || typeof desc !== 'string' || !desc.trim()) {
    return { error: 'Service description is required.' };
  }
  if (!image || typeof image !== 'string' || !image.trim()) {
    return { error: 'Service image URL is required.' };
  }
  if (!iconName || typeof iconName !== 'string' || !iconName.trim()) {
    return { error: 'Service icon name is required.' };
  }

  return {
    value: {
      title: title.trim(),
      desc: desc.trim(),
      image: image.trim(),
      iconName: iconName.trim(),
    },
  };
}

export interface FAQInput {
  question: string;
  answer: string;
  category: string;
}

export function validateFAQInput(input: any): { error?: string; value?: FAQInput } {
  const { question, answer, category } = input;
  if (!question || typeof question !== 'string' || !question.trim()) {
    return { error: 'FAQ question is required.' };
  }
  if (!answer || typeof answer !== 'string' || !answer.trim()) {
    return { error: 'FAQ answer is required.' };
  }
  if (!category || typeof category !== 'string' || !category.trim()) {
    return { error: 'FAQ category is required.' };
  }

  return {
    value: {
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim(),
    },
  };
}

export interface GalleryItemInput {
  category: string;
  title: string;
  image: string;
  aspect?: string;
}

export function validateGalleryItemInput(input: any): { error?: string; value?: GalleryItemInput } {
  const { category, title, image, aspect } = input;
  if (!category || typeof category !== 'string' || !category.trim()) {
    return { error: 'Gallery item category is required.' };
  }
  if (!title || typeof title !== 'string' || !title.trim()) {
    return { error: 'Gallery item title is required.' };
  }
  if (!image || typeof image !== 'string' || !image.trim()) {
    return { error: 'Gallery item image URL is required.' };
  }

  return {
    value: {
      category: category.trim(),
      title: title.trim(),
      image: image.trim(),
      aspect: aspect ? String(aspect).trim() : 'aspect-[4/3]',
    },
  };
}

export interface WebsiteSettingInput {
  key: string;
  value: string;
  description?: string;
}

export function validateWebsiteSettingInput(input: any): { error?: string; value?: WebsiteSettingInput } {
  const { key, value, description } = input;
  if (!key || typeof key !== 'string' || !key.trim()) {
    return { error: 'Website setting key is required.' };
  }
  if (value === undefined || typeof value !== 'string') {
    return { error: 'Website setting value is required.' };
  }

  return {
    value: {
      key: key.trim(),
      value: value.trim(),
      description: description ? String(description).trim() : undefined,
    },
  };
}

export interface ReorderInput {
  ids: string[];
}

export function validateReorderInput(input: any): { error?: string; value?: ReorderInput } {
  const { ids } = input;
  if (!ids || !Array.isArray(ids)) {
    return { error: 'An array of IDs is required for reordering.' };
  }
  for (const id of ids) {
    if (typeof id !== 'string') {
      return { error: 'Each ID in the reordering array must be a string.' };
    }
  }
  return { value: { ids } };
}
