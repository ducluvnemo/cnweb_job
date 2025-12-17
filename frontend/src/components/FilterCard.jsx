import React, { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { useDispatch } from 'react-redux';
import { setSelectedValueFilter } from './redux/jobSlice';
import axios from 'axios';
import { JOP_API_END_POINT } from './utils/constant';
import { Loader2, MapPin, Briefcase, X } from 'lucide-react';
import { Button } from './ui/button';

const FilterCard = () => {
  const [selectedValue, setSelectedValue] = useState({});
  const [selectedDisplay, setSelectedDisplay] = useState({}); // For UI display
  const [provinces, setProvinces] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  // Fetch provinces from Vietnam API
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await axios.get('https://api.vnappmob.com/api/v2/province/');
        if (res.data && res.data.results) {
          // Sort provinces: major cities first
          const majorCities = ['Thành phố Hà Nội', 'Thành phố Hồ Chí Minh', 'Thành phố Đà Nẵng', 'Thành phố Hải Phòng', 'Thành phố Cần Thơ'];
          const sorted = res.data.results.sort((a, b) => {
            const aIsMajor = majorCities.includes(a.province_name);
            const bIsMajor = majorCities.includes(b.province_name);
            if (aIsMajor && !bIsMajor) return -1;
            if (!aIsMajor && bIsMajor) return 1;
            return a.province_name.localeCompare(b.province_name);
          });
          setProvinces(sorted);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch positions from backend API
  useEffect(() => {
    const fetchPositions = async () => {
      try {
        const res = await axios.get(`${JOP_API_END_POINT}/filters/positions`);
        if (res.data && res.data.success) {
          setPositions(res.data.positions);
        }
      } catch (error) {
        console.error('Error fetching positions:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPositions();
  }, []);

  const handleChangeRadio = (filterType, value) => {
    const filterKey = filterType === 'location' ? 'location' : 'title';

    // Normalize location value - remove prefix like "Thành phố", "Tỉnh"
    let normalizedValue = value;
    if (filterType === 'location') {
      normalizedValue = value
        .replace(/^(Thành phố|Tỉnh)\s+/i, '') // Remove prefix
        .trim();
    }

    // Update selected value for filtering (normalized)
    setSelectedValue((prev) => ({
      ...prev,
      [filterKey]: normalizedValue,
    }));

    // Update display value for UI (original)
    setSelectedDisplay((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  const clearFilter = (filterType) => {
    setSelectedValue((prev) => {
      const newValue = { ...prev };
      delete newValue[filterType];
      return newValue;
    });
    setSelectedDisplay((prev) => {
      const newValue = { ...prev };
      delete newValue[filterType];
      return newValue;
    });
  };

  const clearAllFilters = () => {
    setSelectedValue({});
    setSelectedDisplay({});
  };

  useEffect(() => {
    dispatch(setSelectedValueFilter(selectedValue));
  }, [selectedValue, dispatch]);

  if (loading) {
    return (
      <div className="w-full bg-white p-5 rounded-lg shadow-md">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-5">
        <h1 className="font-bold text-xl text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Lọc công việc
        </h1>
        {Object.keys(selectedValue).length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="mt-2 text-white hover:bg-orange-600 hover:text-white text-sm"
          >
            <X className="h-4 w-4 mr-1" />
            Xóa tất cả bộ lọc
          </Button>
        )}
      </div>

      <div className="p-5 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-hide">
        {/* Location Filter */}
        <div className="border-b border-gray-200 pb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-orange-600" />
              Địa điểm
            </h2>
            {selectedValue.location && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('location')}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <RadioGroup
            value={selectedDisplay.location || ''}
            onValueChange={(value) => handleChangeRadio('location', value)}
          >
            <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
              {provinces.map((province) => (
                <div
                  key={province.province_id}
                  className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 transition-colors"
                >
                  <RadioGroupItem
                    value={province.province_name}
                    id={`location-${province.province_id}`}
                    className="text-orange-600"
                  />
                  <Label
                    htmlFor={`location-${province.province_id}`}
                    className="text-gray-700 cursor-pointer flex-1 text-sm"
                  >
                    {province.province_name}
                    {province.province_type === 'Thành phố Trung ương' && (
                      <span className="ml-2 text-xs text-orange-600 font-medium">★</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Position Filter */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-orange-600" />
              Vị trí
            </h2>
            {selectedValue.title && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearFilter('title')}
                className="text-xs text-gray-500 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <RadioGroup
            value={selectedDisplay.title || ''}
            onValueChange={(value) => handleChangeRadio('title', value)}
          >
            <div className="space-y-2">
              {positions.length > 0 ? (
                positions.map((position, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 transition-colors"
                  >
                    <RadioGroupItem
                      value={position}
                      id={`position-${index}`}
                      className="text-orange-600"
                    />
                    <Label
                      htmlFor={`position-${index}`}
                      className="text-gray-700 cursor-pointer flex-1 text-sm"
                    >
                      {position}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">Chưa có vị trí nào</p>
              )}
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* Selected Filters Summary */}
      {Object.keys(selectedValue).length > 0 && (
        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <p className="text-xs text-gray-600 mb-2">Đang lọc:</p>
          <div className="flex flex-wrap gap-2">
            {selectedValue.location && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                <MapPin className="h-3 w-3" />
                {selectedValue.location}
              </span>
            )}
            {selectedValue.title && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                <Briefcase className="h-3 w-3" />
                {selectedValue.title}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterCard;