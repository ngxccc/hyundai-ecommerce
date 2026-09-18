"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminUser, AdminDealerTier } from "@/types/api";
import { Search, UserCheck, Building } from "lucide-react";

interface CustomerDirectoryProps {
  initialUsers: AdminUser[];
  dealerTiers?: AdminDealerTier[];
}

export const CustomerDirectory = ({ initialUsers }: CustomerDirectoryProps) => {
  const t = useTranslations("adminCustomers");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const filteredUsers = initialUsers.filter((user) => {
    const matchesSearch =
      `${user.fullName} ${user.email} ${user.phoneNumber} ${user.dealerCompany?.companyName ?? ""}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedType === "all") return true;
    return user.dealerCompany?.businessType?.toLowerCase() === selectedType;
  });

  const types = [
    { key: "all", label: t("tabs.all") },
    { key: "dealer", label: t("tabs.dealer") },
    { key: "contractor", label: t("tabs.contractor") },
    { key: "distributor", label: t("tabs.distributor") },
    { key: "end_user", label: t("tabs.end_user") },
  ];

  return (
    <div className="space-y-4">
      {/* Search & Tabs Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Business Type Filter Buttons */}
        <div className="border-border flex flex-wrap gap-1 border-b pb-2 md:border-b-0 md:pb-0">
          {types.map((type) => (
            <Button
              key={type.key}
              variant={selectedType === type.key ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedType(type.key)}
              className="h-8 text-xs font-medium"
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="border-border bg-card overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="font-semibold">{t("table.name")}</TableHead>
              <TableHead className="font-semibold">
                {t("table.contact")}
              </TableHead>
              <TableHead className="font-semibold">{t("table.role")}</TableHead>
              <TableHead className="font-semibold">
                {t("table.company")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-12 text-center text-sm"
                >
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30">
                  <TableCell className="text-foreground font-medium">
                    <div className="flex items-center gap-2">
                      <UserCheck className="text-muted-foreground size-4" />
                      <span>{user.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground flex flex-col text-xs">
                      <span>{user.email}</span>
                      <span>{user.phoneNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.dealerCompany ? (
                      <div className="text-foreground flex items-center gap-1.5 text-xs">
                        <Building className="text-primary size-3.5 shrink-0" />
                        <span>{user.dealerCompany.companyName}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground/60 text-xs">
                        —
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
