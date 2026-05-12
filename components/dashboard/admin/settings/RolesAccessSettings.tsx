"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RolesAccessData } from "./AdminSettings"

interface RolesAccessSettingsProps {
  data: RolesAccessData
}

export default function RolesAccessSettings({ data }: RolesAccessSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Roles & Access Overview</h3>
          <p className="text-sm text-muted-foreground">
            View user roles and their access permissions.
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
          Beta
        </Badge>
      </div>

      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex flex-col items-start gap-3">
            <Badge variant="outline" className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-amber-200 dark:border-amber-800 truncate">
              Coming Soon
            </Badge>
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                Custom Roles
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create custom roles with specific permissions. Available in a future update.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Roles</CardTitle>
          <CardDescription>
            A list of all roles and their assigned permissions in your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="text-right">Users</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {role.name}
                      <Badge variant="outline" className="text-xs">
                        {role.type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {role.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((permission) => (
                        <Badge key={permission} variant="secondary">
                          {permission}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="secondary">
                          +{role.permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {role.users}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Default Role Assignment
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">Beta</Badge>
          </CardTitle>
          <CardDescription>
            Default role for new users (configurable in future updates).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="text-sm font-medium">Default Role</div>
              <div className="text-sm text-muted-foreground">
                New users are assigned this role by default
              </div>
            </div>
            <Badge className="capitalize" variant="outline">
              {data.defaultRole.toLowerCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}