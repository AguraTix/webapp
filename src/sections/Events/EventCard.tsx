import React from 'react';
import { MapPin, Calendar, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  id: string | number;
  title: string;
  date: string;
  location: string;
  image: string;
}

const EventCard: React.FC<EventCardProps> = ({ id, title, date, location, image }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = React.useState(false);

  const handleViewDetails = () => {
    navigate(`/specificEvent/${id}`);
  };

  const handleImageError = () => {
    console.log("Image failed to load:", image);
    setImageError(true);
  };

  return (
    <div className="flex flex-row items-center bg-black rounded-2xl border border-[#23232B] shadow-sm overflow-hidden w-auto min-w-[320px] max-w-full p-2 gap-2 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
      <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 md:w-52 md:h-40 bg-gray-800 rounded-xl">
        {!imageError && image ? (
          <img 
            src={image} 
            alt={title} 
            className="object-cover w-full h-full rounded-xl" 
            onError={handleImageError}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-500 text-xs">
            No Image
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center flex-1 min-w-[150px] h-full gap-2">
        <h2 className="mb-1 text-lg font-bold leading-tight text-gray-400 truncate md:text-xl">{title}</h2>
        <div className="mb-1 text-xs text-gray-400 truncate md:text-sm">Platini</div>
        <div className="flex items-center gap-2 mb-1 text-xs text-gray-400">
          <Calendar className="w-4 h-4" />
          <span className="truncate">{date}</span>
        </div>
        <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
          <MapPin className="w-4 h-4" />
          <span className="truncate">{location}</span>
        </div>
        <button
          onClick={handleViewDetails}
          className="w-full max-w-xs px-0 py-3 bg-[#23232B] text-gray-400 rounded-full text-sm flex items-center justify-center gap-2 hover:bg-primary transition-all duration-200"
        >
          <ArrowUpRight className="w-5 h-5" />
          View Details
        </button>
      </div>
    </div>
  );
};

export default EventCard;
