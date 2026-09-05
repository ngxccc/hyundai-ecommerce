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
import { Card, CardContent } from "@/components/ui/card";
import type { AdminUser, AdminDealerTier } from "@/types/api";
import { Search, UserCheck, Building } from "lucide-react";

interface CustomerDirectoryProps {
  initialUsers: AdminUser[];
  dealerTiers?: AdminDealerTier[];
}

export const CustomerDirectory = ({ initialUsers }: CustomerDirectoryProps) => {
  const t = useTranslations("AdminCustomers");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = initialUsers.filter((user) => {
    const searchString =
      `${user.fullName} ${user.email} ${user.phoneNumber} ${user.dealerCompany?.companyName ?? ""}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("table.name")}</TableHead>
                <TableHead>{t("table.contact")}</TableHead>
                <TableHead>{t("table.role")}</TableHead>
                <TableHead>{t("table.company")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-8 text-center text-zinc-500"
                  >
                    Chưa có khách hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-semibold">
                      <div className="flex items-center gap-2">
                        <UserCheck className="size-4 text-zinc-400" />
                        <span>{user.fullName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs text-zinc-500">
                        <span>{user.email}</span>
                        <span>{user.phoneNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.dealerCompany ? (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-700">
                          <Building className="text-primary size-3.5" />
                          <span>{user.dealerCompany.companyName}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
