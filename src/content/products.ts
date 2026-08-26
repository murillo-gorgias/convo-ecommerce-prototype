/**
 * ============================================================================
 * PRODUCTS
 * ============================================================================
 *
 * The pieces the assistant recommends. Real products, real prices, real
 * photography. Swapping brands means replacing this file — nothing that
 * renders these needs to change.
 *
 * `swatches` are the metal and stone colours offered for a piece, drawn as
 * small dots under the name. `moreColours` is the "+8" that follows them.
 */

import { asset } from './asset';

export type Product = {
  id: string;
  name: string;
  price: number;
  material: string;
  image: string;
  swatches: string[];
  moreColours?: number;
};

export const recommendations: Product[] = [
  {
    id: 'carmen-beaded',
    name: 'Carmen Beaded Necklace',
    price: 178,
    material: '18k Vermeil',
    image: asset('/brand/products/carmen-beaded.jpg'),
    swatches: ['#7B2D26', '#8A6A4B', '#D9C7A7', '#2E4A8F'],
    moreColours: 6,
  },
  {
    id: 'herringbone',
    name: 'Bold Herringbone Chain',
    price: 338,
    material: '18k Vermeil',
    image: asset('/brand/products/herringbone.jpg'),
    swatches: ['#EAC37C', '#C8C8C8'],
  },
  {
    id: 'floating-sapphire',
    name: 'Floating Sapphire Necklace',
    price: 188,
    material: '18k Vermeil',
    image: asset('/brand/products/floating-sapphire.jpg'),
    swatches: ['#EAC37C', '#C8C8C8'],
  },
  {
    id: 'baguette-station',
    name: 'Baguette Gemstone Station',
    price: 718,
    material: '14k Yellow Gold',
    image: asset('/brand/products/baguette-station.jpg'),
    swatches: ['#1F6F44', '#2E4A8F', '#7B2D26'],
    moreColours: 3,
  },
  {
    id: 'anya-turquoise',
    name: 'Anya Turquoise Beaded',
    price: 298,
    material: '10k Yellow Gold',
    image: asset('/brand/products/anya-turquoise.jpg'),
    swatches: ['#4FB3BF', '#EAC37C'],
  },
  {
    id: 'sapphire-cluster',
    name: 'Sapphire Cluster Necklace',
    price: 238,
    material: '18k Vermeil',
    image: asset('/brand/products/sapphire-cluster.jpg'),
    swatches: ['#EAC37C', '#C8C8C8'],
  },
  {
    id: 'jojo-loop',
    name: 'Jojo Loop Pendant',
    price: 198,
    material: 'Silver + Vermeil',
    image: asset('/brand/products/jojo-loop.jpg'),
    swatches: ['#C8C8C8', '#EAC37C'],
  },
  {
    id: 'vermeil-linked',
    name: 'Vermeil Linked Necklace',
    price: 238,
    material: '18k Vermeil',
    image: asset('/brand/products/vermeil-linked.jpg'),
    swatches: ['#EAC37C'],
  },
];
