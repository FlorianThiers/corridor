/** Eerste batch op zone-detail; “Meer laden” haalt volgende pagina via API. */
export const ZONE_GALLERY_PAGE_SIZE = 24

export type ZoneGalleryItem = {
  id: string
  public_url: string
  caption?: string | null
}
