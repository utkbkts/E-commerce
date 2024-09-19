import { Link } from "react-router-dom";
import PropTypes from "prop-types";
const CategoryItem = ({ category }) => {
  const { name, imageUrl, href } = category;

  return (
    <div className="relative overflow-hidden h-96 w-full rounded-lg group">
      <Link to={"/category" + href}>
        <div className="w-full h-full cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900 opacity-50 z-10" />
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <h3 className="text-white text-2xl font-bold mb-2">{name}</h3>
            <p className="text-gray-200 text-sm">Explore {name}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

CategoryItem.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
    href: PropTypes.string.isRequired,
  }),
};

export default CategoryItem;
