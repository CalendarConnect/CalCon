"use client";

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { SignOutButton, useUser } from "@clerk/nextjs";
import {
    LogOut,
    Settings,
    Sparkles,
    User
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";

export function UserProfile() {
    const { user } = useUser();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-7 w-7 rounded-full">
                    <Avatar className="h-7 w-7 rounded-full ring-1 ring-border">
                        <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User Profile"} />
                        <AvatarFallback className="bg-blue-50 text-blue-900 text-xs">
                            {user?.firstName?.[0]}
                            {user?.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 bg-white" align="end">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-0.5">
                        <p className="text-xs font-medium leading-none text-gray-900">{user?.fullName}</p>
                        <p className="text-[0.7rem] leading-none text-gray-500">
                            {user?.emailAddresses[0].emailAddress}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuGroup>
                    <Link href="/user-profile">
                        <DropdownMenuItem className="focus:bg-gray-50 text-gray-700 hover:text-gray-900 py-1.5">
                            <User className="mr-2 h-3 w-3" />
                            <span className="text-xs">Profile</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/dashboard/settings">
                        <DropdownMenuItem className="focus:bg-gray-50 text-gray-700 hover:text-gray-900 py-1.5">
                            <Settings className="mr-2 h-3 w-3" />
                            <span className="text-xs">Settings</span>
                        </DropdownMenuItem>
                    </Link>
                    <Link href="/#pricing">
                        <DropdownMenuItem className="focus:bg-gray-50 text-gray-700 hover:text-gray-900 py-1.5">
                            <Sparkles className="mr-2 h-3 w-3" />
                            <span className="text-xs">Upgrade Plan</span>
                        </DropdownMenuItem>
                    </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-gray-200" />
                <SignOutButton>
                    <DropdownMenuItem className="focus:bg-gray-50 text-gray-700 hover:text-gray-900 py-1.5">
                        <LogOut className="mr-2 h-3 w-3" />
                        <span className="text-xs">Log out</span>
                    </DropdownMenuItem>
                </SignOutButton>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
