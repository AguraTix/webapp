import { Bell } from "lucide-react";
import type { UserProfile } from "../../api/auth";

interface HeaderProps {
  userProfile: UserProfile | null;
}

const Header = ({ userProfile }: HeaderProps) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex-1">
      <h2 className="text-lg md:text-[16px] font-semibold text-[#CDCDE0]">
        Welcome back {userProfile?.name || userProfile?.email || "User"}
      </h2>
      {userProfile?.email && (
        <p className="text-sm text-gray-400 mt-1">{userProfile.email}</p>
      )}
    </div>
    <div className="flex items-center justify-end gap-4">
      <button className="p-2 rounded-full bg-[#23232B] hover:bg-primary/20 text-[#CDCDE0] transition-colors">
        <Bell className="w-5 h-5" />
      </button>
      <div className="flex items-center justify-center text-lg font-bold text-white rounded-full w-9 h-9 bg-primary">
        {userProfile?.profile_photo ? (
          <img
            src={userProfile.profile_photo}
            alt="Profile"
            className="rounded-full w-full h-full object-cover"
            onError={(e) => {
              // Fallback to initials if image fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full rounded-full bg-primary flex items-center justify-center text-white font-semibold ${
            userProfile?.profile_photo ? 'hidden' : 'flex'
          }`}
        >
          {userProfile?.name 
            ? userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            : userProfile?.email 
            ? userProfile.email[0].toUpperCase()
            : 'U'
          }
        </div>
      </div>
    </div>
  </div>
);

export default Header;