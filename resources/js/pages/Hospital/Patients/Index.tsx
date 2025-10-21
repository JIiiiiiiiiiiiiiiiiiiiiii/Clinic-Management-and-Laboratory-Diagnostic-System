import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import SortableTable from '@/components/SortableTable';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  User,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

interface Patient {
  id: number;
  patient_no: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  full_name: string;
  birthdate: string;
  age: number;
  sex: string;
  mobile_no?: string;
  present_address?: string;
  occupation?: string;
  civil_status?: string;
  created_at: string;
}

interface PatientStats {
  total_patients: number;
  male_patients: number;
  female_patients: number;
  new_this_month: number;
}

interface Props {
  patients: {
    data: Patient[];
    links: any[];
    meta: any;
  };
  stats: PatientStats;
  filters: {
    search?: string;
    sex?: string;
    age_min?: number;
    age_max?: number;
    date_from?: string;
    date_to?: string;
  };
}

export default function HospitalPatientsIndex({ patients, stats, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '');
  const [sex, setSex] = useState(filters.sex || '');
  const [ageMin, setAgeMin] = useState(filters.age_min || '');
  const [ageMax, setAgeMax] = useState(filters.age_max || '');
  const [dateFrom, setDateFrom] = useState(filters.date_from || '');
  const [dateTo, setDateTo] = useState(filters.date_to || '');

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hospital Dashboard', href: route('hospital.dashboard') },
    { label: 'Patients', href: route('hospital.patients.index') },
  ];

  const handleFilter = () => {
    router.get(route('hospital.patients.index'), {
      search: search || undefined,
      sex: sex || undefined,
      age_min: ageMin || undefined,
      age_max: ageMax || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    }, {
      preserveState: true,
      replace: true
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSex('');
    setAgeMin('');
    setAgeMax('');
    setDateFrom('');
    setDateTo('');
    router.get(route('hospital.patients.index'), {}, {
      preserveState: true,
      replace: true
    });
  };

  const handleDelete = (patient: Patient) => {
    if (confirm(`Are you sure you want to delete patient ${patient.full_name}?`)) {
      router.delete(route('hospital.patients.destroy', patient.id));
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Patients - Hospital" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
            <p className="text-muted-foreground">
              View and manage all patients in the system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={route('hospital.patients.create')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={route('hospital.patients.refer')}>
                Refer Patient
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_patients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Registered in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Male Patients</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.male_patients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Male patients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Female Patients</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.female_patients.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Female patients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.new_this_month.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Registered this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter patients by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Name, patient no..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="sex">Gender</Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger>
                    <SelectValue placeholder="All genders" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="age_min">Min Age</Label>
                <Input
                  id="age_min"
                  type="number"
                  placeholder="0"
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="age_max">Max Age</Label>
                <Input
                  id="age_max"
                  type="number"
                  placeholder="100"
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="date_from">From Date</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="date_to">To Date</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button onClick={handleFilter}>
                Apply Filters
              </Button>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
            <CardDescription>
              {patients.meta.total} patients found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SortableTable
              data={patients.data}
              columns={[
                {
                  key: 'patient_no',
                  label: 'Patient No',
                  sortable: true,
                  className: 'font-medium'
                },
                {
                  key: 'name',
                  label: 'Name',
                  sortable: true,
                  render: (value, patient) => (
                    <div>
                      <div className="font-medium">{patient.full_name}</div>
                      {patient.occupation && (
                        <div className="text-sm text-muted-foreground">
                          {patient.occupation}
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  key: 'age',
                  label: 'Age',
                  sortable: true
                },
                {
                  key: 'sex',
                  label: 'Gender',
                  sortable: true,
                  render: (value) => (
                    <Badge variant="outline" className="capitalize">
                      {value}
                    </Badge>
                  )
                },
                {
                  key: 'mobile_no',
                  label: 'Contact',
                  sortable: true,
                  render: (value) => (
                    value ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {value}
                      </div>
                    ) : null
                  )
                },
                {
                  key: 'present_address',
                  label: 'Address',
                  sortable: true,
                  render: (value) => (
                    value ? (
                      <div className="flex items-center gap-1 text-sm max-w-[200px] truncate">
                        <MapPin className="h-3 w-3" />
                        {value}
                      </div>
                    ) : null
                  )
                },
                {
                  key: 'created_at',
                  label: 'Registered',
                  sortable: true,
                  render: (value) => new Date(value).toLocaleDateString()
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  sortable: false,
                  render: (value, patient) => (
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={route('hospital.patients.show', patient.id)}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={route('hospital.patients.edit', patient.id)}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDelete(patient)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )
                }
              ]}
              defaultSort={{ key: 'created_at', direction: 'desc' }}
              emptyMessage="No patients found"
              emptyIcon={Users}
            />

            {/* Pagination */}
            {patients.links && patients.links.length > 3 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {patients.meta.from} to {patients.meta.to} of {patients.meta.total} results
                </div>
                <div className="flex gap-1">
                  {patients.links.map((link, index) => (
                    <Button
                      key={index}
                      variant={link.active ? "default" : "outline"}
                      size="sm"
                      disabled={!link.url}
                      onClick={() => link.url && router.get(link.url)}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}