"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ALL_CLUSTERS,
  CLUSTERS,
  type ClusterFilter as ClusterFilterValue,
} from "@/config/clusters";

interface ClusterFilterProps {
  value: ClusterFilterValue;
  onChange: (value: ClusterFilterValue) => void;
}

export function ClusterFilter({ value, onChange }: ClusterFilterProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => onChange(next as ClusterFilterValue)}
    >
      <SelectTrigger
        className="w-48"
        aria-label="Filter cluster konten"
        data-slot="cluster-filter"
      >
        <SelectValue placeholder="Pilih cluster" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_CLUSTERS}>Semua cluster</SelectItem>
        {CLUSTERS.map((cluster) => (
          <SelectItem key={cluster} value={cluster}>
            {cluster}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
