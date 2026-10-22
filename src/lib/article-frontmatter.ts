export type HeroStyle = 'photoreal';

// Existing content supports heterogeneous legacy fields; named fields below
// keep the new contract strict without changing those established shapes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ArticleFrontmatter extends Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  category?: any;
  heroStyle?: HeroStyle;
}

export function validateArticleFrontmatter(
  value: Record<string, unknown>,
  source = 'article'
): ArticleFrontmatter {
  if (value.heroStyle !== undefined && value.heroStyle !== 'photoreal') {
    throw new Error(
      `Invalid heroStyle in ${source}: expected "photoreal" or no value`
    );
  }
  return value as ArticleFrontmatter;
}
