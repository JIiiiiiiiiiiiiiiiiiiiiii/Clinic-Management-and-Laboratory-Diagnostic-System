import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  DollarSign,
  Users,
  AlertCircle
} from 'lucide-react';

interface ClinicProcedure {
  id: number;
  name: string;
  code: string;
  description?: string;
  category: string;
  subcategory?: string;
  price: number;
  duration_minutes: number;
  requirements?: string[];
  equipment_needed?: string[];
  personnel_required?: string[];
  is_active: boolean;
  requires_prescription: boolean;
  is_emergency: boolean;
  sort_order: number;
  created_at: string;
}

interface ClinicProceduresIndexProps {
  procedures: {
    data: ClinicProcedure[];
    links: any[];
    meta: any;
  };
  filters: {
    search?: string;
    category?: string;
    subcategory?: string;
    status?: string;
  };
  categories: string[];
  subcategories: string[];
}

export default function ClinicProceduresIndex({ procedures, filters, categories, subcategories }: ClinicProceduresIndexProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [category, setCategory] = useState(filters.category || 'all');
  const [subcategory, setSubcategory] = useState(filters.subcategory || 'all');
  const [status, setStatus] = useState(filters.status || 'all');

  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'search') {
      setSearch(value);
    } else if (filterType === 'category') {
      setCategory(value);
    } else if (filterType === 'subcategory') {
      setSubcategory(value);
    } else if (filterType === 'status') {
      setStatus(value);
    }

    router.get(route('admin.clinic-procedures.index'), {
      search: filterType === 'search' ? value : search,
      category: filterType === 'category' ? value : category,
      subcategory: filterType === 'subcategory' ? value : subcategory,
      status: filterType === 'status' ? value : status,
    }, {
      preserveState: true,
      replace: true,
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'laboratory': return 'bg-blue-100 text-blue-800';
      case 'diagnostic': return 'bg-green-100 text-green-800';
      case 'treatment': return 'bg-purple-100 text-purple-800';
      case 'consultation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}m`;
  };

  const toggleStatus = (procedure: ClinicProcedure) => {
    router.put(route('admin.clinic-procedures.toggle-status', procedure.id), {}, {
      preserveState: true,
    });
  };

  return (
    <>
      <Head title="Clinic Procedures" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Clinic Procedures</h1>
            <p className="text-muted-foreground">
              Manage clinic procedures and services
            </p>
          </div>
          <Link href={route('admin.clinic-procedures.create')}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Procedure
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search procedures..."
                    value={search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Select value={category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={subcategory} onValueChange={(value) => handleFilterChange('subcategory', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subcategory" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subcategories</SelectItem>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub} value={sub}>
                        {sub.charAt(0).toUpperCase() + sub.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Select value={status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Procedures List */}
        <div className="grid gap-4">
          {procedures.data.map((procedure) => (
            <Card key={procedure.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-semibold text-lg">{procedure.name}</h3>
                        <p className="text-sm text-muted-foreground">Code: {procedure.code}</p>
                        {procedure.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {procedure.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge className={getCategoryColor(procedure.category)}>
                        {procedure.category}
                      </Badge>
                      {procedure.subcategory && (
                        <Badge variant="outline">
                          {procedure.subcategory}
                        </Badge>
                      )}
                      <Badge className={getStatusColor(procedure.is_active)}>
                        {procedure.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {procedure.is_emergency && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Emergency
                        </Badge>
                      )}
                      {procedure.requires_prescription && (
                        <Badge variant="outline">
                          Requires Prescription
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-4 w-4" />
                        <span>₱{procedure.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDuration(procedure.duration_minutes)}</span>
                      </div>
                      {procedure.personnel_required && procedure.personnel_required.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{procedure.personnel_required.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(procedure)}
                    >
                      {procedure.is_active ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <div className="flex space-x-1">
                      <Link href={route('admin.clinic-procedures.show', procedure.id)}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={route('admin.clinic-procedures.edit', procedure.id)}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this procedure?')) {
                            router.delete(route('admin.clinic-procedures.destroy', procedure.id));
                          }
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {procedures.links && procedures.links.length > 3 && (
          <div className="flex items-center justify-center space-x-2">
            {procedures.links.map((link, index) => (
              <Button
                key={index}
                variant={link.active ? "default" : "outline"}
                size="sm"
                onClick={() => link.url && router.get(link.url)}
                disabled={!link.url}
              >
                {link.label}
              </Button>
            ))}
          </div>
        )}

        {/* Empty State */}
        {procedures.data.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Plus className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No procedures found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {search || category !== 'all' || subcategory !== 'all' || status !== 'all'
                    ? 'Try adjusting your filters.'
                    : 'Get started by adding a new clinic procedure.'
                  }
                </p>
                <div className="mt-6">
                  <Link href={route('admin.clinic-procedures.create')}>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Procedure
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
