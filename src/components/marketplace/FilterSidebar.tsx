import { MarketplaceFilters, ItemCategory, ItemCondition } from "@/types/marketplace";
import { Event } from "@/types/marketplace";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

interface FilterSidebarProps {
  filters: MarketplaceFilters;
  onFiltersChange: (filters: MarketplaceFilters) => void;
  events: Event[];
}

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'apparel', label: 'Apparel' },
  { value: 'collectible', label: 'Collectibles' },
  { value: 'nft', label: 'NFTs' },
  { value: 'accessory', label: 'Accessories' },
  { value: 'badge', label: 'Badges' },
  { value: 'other', label: 'Other' },
];

const conditions: { value: ItemCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

export default function FilterSidebar({ filters, onFiltersChange, events }: FilterSidebarProps) {
  const [priceMin, setPriceMin] = useState(filters.priceMin?.toString() || '');
  const [priceMax, setPriceMax] = useState(filters.priceMax?.toString() || '');

  const toggleCategory = (category: ItemCategory) => {
    const current = filters.category || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    onFiltersChange({ ...filters, category: updated.length > 0 ? updated : undefined });
  };

  const toggleCondition = (condition: ItemCondition) => {
    const current = filters.condition || [];
    const updated = current.includes(condition)
      ? current.filter(c => c !== condition)
      : [...current, condition];
    onFiltersChange({ ...filters, condition: updated.length > 0 ? updated : undefined });
  };

  const updatePriceRange = () => {
    onFiltersChange({
      ...filters,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
    });
  };

  const clearFilters = () => {
    setPriceMin('');
    setPriceMax('');
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-lime-400 hover:text-lime-300 transition"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <h4 className="text-sm font-medium mb-3 text-white/70">Category</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.category?.includes(category.value) || false}
                onChange={() => toggleCategory(category.value)}
                className="w-4 h-4 rounded border-white/20 bg-neutral-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-0"
              />
              <span className="text-sm group-hover:text-lime-400 transition">{category.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Condition Filter */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <h4 className="text-sm font-medium mb-3 text-white/70">Condition</h4>
        <div className="space-y-2">
          {conditions.map(condition => (
            <label key={condition.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.condition?.includes(condition.value) || false}
                onChange={() => toggleCondition(condition.value)}
                className="w-4 h-4 rounded border-white/20 bg-neutral-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-0"
              />
              <span className="text-sm group-hover:text-lime-400 transition">{condition.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <h4 className="text-sm font-medium mb-3 text-white/70">Price Range (SOL)</h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            onBlur={updatePriceRange}
            className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-lime-400"
          />
          <span className="text-white/30">-</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            onBlur={updatePriceRange}
            className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-lime-400"
          />
        </div>
      </div>

      {/* Event Filter */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <h4 className="text-sm font-medium mb-3 text-white/70">Event</h4>
        <select
          value={filters.eventId || ''}
          onChange={(e) => onFiltersChange({ ...filters, eventId: e.target.value || undefined })}
          className="w-full px-3 py-2 bg-neutral-800 border border-white/10 rounded-lg text-sm focus:outline-none focus:border-lime-400"
        >
          <option value="">All Events</option>
          {events.map(event => (
            <option key={event.id} value={event.id}>
              {event.name}
            </option>
          ))}
        </select>
      </div>

      {/* Item Type Filter */}
      <div className="mb-6 pb-6 border-b border-white/10">
        <h4 className="text-sm font-medium mb-3 text-white/70">Item Type</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="itemType"
              checked={filters.isNFT === undefined}
              onChange={() => onFiltersChange({ ...filters, isNFT: undefined })}
              className="w-4 h-4 border-white/20 bg-neutral-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-0"
            />
            <span className="text-sm group-hover:text-lime-400 transition">All Items</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="itemType"
              checked={filters.isNFT === true}
              onChange={() => onFiltersChange({ ...filters, isNFT: true })}
              className="w-4 h-4 border-white/20 bg-neutral-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-0"
            />
            <span className="text-sm group-hover:text-lime-400 transition">NFTs Only</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name="itemType"
              checked={filters.isNFT === false}
              onChange={() => onFiltersChange({ ...filters, isNFT: false })}
              className="w-4 h-4 border-white/20 bg-neutral-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-0"
            />
            <span className="text-sm group-hover:text-lime-400 transition">Physical Only</span>
          </label>
        </div>
      </div>

      {/* Verified Events Only */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.verified || false}
            onChange={(e) => onFiltersChange({ ...filters, verified: e.target.checked || undefined })}
            className="w-4 h-4 rounded border-white/20 bg-neutral-800 text-lime-400 focus:ring-lime-400 focus:ring-offset-0"
          />
          <span className="text-sm group-hover:text-lime-400 transition">Verified Events Only</span>
        </label>
      </div>
    </div>
  );
}