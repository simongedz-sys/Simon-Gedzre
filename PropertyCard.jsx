import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Building2, MapPin, BedDouble, Bath, Square, Edit, Trash2, Eye } from "lucide-react";

export default function PropertyCard({ property, progress, onView, onEdit, onDelete }) {
  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
      sold: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
      cancelled: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
    };
    return colors[status] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 group">
      {/* Property Image */}
      {property.primary_photo_url ? (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={property.primary_photo_url} 
            alt={property.address}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={`${getStatusColor(property.status)} border shadow-lg font-bold`}>
              {property.status?.toUpperCase()}
            </Badge>
          </div>

          {/* Price Overlay */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/70 backdrop-blur-md rounded-lg px-3 py-1 border border-white/20">
              <p className="text-white font-bold text-lg">
                ${property.price?.toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
          <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-600" />
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <Badge className={`${getStatusColor(property.status)} border font-bold`}>
              {property.status?.toUpperCase()}
            </Badge>
          </div>

          {/* Price */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/70 backdrop-blur-md rounded-lg px-3 py-1 border border-white/20">
              <p className="text-white font-bold text-lg">
                ${property.price?.toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      <CardContent className="p-4 space-y-3">
        {/* Address */}
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1 line-clamp-1">
            {property.address}
          </h3>
          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-3 h-3" />
            <span>{property.city}, {property.state}</span>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          {property.bedrooms && (
            <div className="flex items-center gap-1">
              <BedDouble className="w-4 h-4" />
              <span>{property.bedrooms} bed</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms} bath</span>
            </div>
          )}
          {property.square_feet && (
            <div className="flex items-center gap-1">
              <Square className="w-4 h-4" />
              <span>{property.square_feet.toLocaleString()} sqft</span>
            </div>
          )}
        </div>

        {/* Progress Bars */}
        {progress && (
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            {/* Listing Progress */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Listing Progress
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {progress.listing_side_progress}%
                </span>
              </div>
              <Progress value={progress.listing_side_progress} className="h-2">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.listing_side_progress}%` }}
                />
              </Progress>
            </div>

            {/* Selling Progress */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Selling Progress
                </span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  {progress.selling_side_progress}%
                </span>
              </div>
              <Progress value={progress.selling_side_progress} className="h-2">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-400 dark:to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress.selling_side_progress}%` }}
                />
              </Progress>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          <Button 
            variant="outline" 
            onClick={onView}
            className="flex-1 text-xs"
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          {onEdit && (
            <Button 
              variant="outline" 
              onClick={onEdit}
              className="flex-1 text-xs"
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button 
              variant="destructive" 
              onClick={onDelete}
              size="sm"
              className="text-xs px-2"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}