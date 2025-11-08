import ProductCard from '../ProductCard';
import hoodieImage from '@assets/generated_images/Beige_oversized_hoodie_product_4620f57a.png';

export default function ProductCardExample() {
  return (
    <div className="max-w-sm">
      <ProductCard
        id="1"
        name="Oversized Beige Hoodie"
        price={2499}
        image={hoodieImage}
        category="Hoodies"
        customizable={true}
      />
    </div>
  );
}
