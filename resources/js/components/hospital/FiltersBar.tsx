import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface FiltersBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    status?: string;
    onStatusChange?: (value: string) => void;
    secondaryFilterLabel?: string;
    secondaryFilterValue?: string;
    onSecondaryFilterChange?: (value: string) => void;
    onApply: () => void;
    onClear: () => void;
}

export default function FiltersBar({
    search,
    onSearchChange,
    status,
    onStatusChange,
    secondaryFilterLabel,
    secondaryFilterValue,
    onSecondaryFilterChange,
    onApply,
    onClear,
}: FiltersBarProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                    <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                    <Input id="search" placeholder="Search..." value={search} onChange={(e) => onSearchChange(e.target.value)} className="pl-9" />
                </div>
            </div>
            {onStatusChange && (
                <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={onStatusChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All Statuses</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            {onSecondaryFilterChange && (
                <div>
                    <Label>{secondaryFilterLabel || 'Filter'}</Label>
                    <Select value={secondaryFilterValue} onValueChange={onSecondaryFilterChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="">All</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}
            <div className="flex items-end gap-2">
                <Button onClick={onApply} className="flex-1">
                    Apply Filters
                </Button>
                <Button variant="outline" onClick={onClear}>
                    Clear
                </Button>
            </div>
        </div>
    );
}
