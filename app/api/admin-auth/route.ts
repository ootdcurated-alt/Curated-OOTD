import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_session")?.value === "adminootd_authenticated";

  if (!isAdmin) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const profileCookie = cookieStore.get("admin_profile")?.value;
  let profile = {
    username: "adminootd",
    email: "adminootd@gmail.com",
    avatar_url: "",
  };

  if (profileCookie) {
    try {
      profile = { ...profile, ...JSON.parse(profileCookie) };
    } catch {
      // Ignore
    }
  }

  return NextResponse.json({ authenticated: true, profile });
}

export async function POST(request: NextRequest) {
  try {
    const { action, username, password, avatar_url, new_password } = await request.json();
    const cookieStore = await cookies();

    if (action === "login") {
      const cleanUser = (username || "").trim().toLowerCase();
      const currentPassword = cookieStore.get("admin_password")?.value || "admin1027";

      const isValidAdmin =
        (cleanUser === "adminootd" || cleanUser === "adminootd@gmail.com") &&
        password === currentPassword;

      if (isValidAdmin) {
        cookieStore.set("admin_session", "adminootd_authenticated", {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7,
          sameSite: "lax",
        });

        return NextResponse.json({
          success: true,
          user: {
            username: "adminootd",
            email: "adminootd@gmail.com",
            role: "admin",
          },
        });
      }

      return NextResponse.json(
        { success: false, message: "Kredensial admin tidak valid" },
        { status: 401 }
      );
    }

    if (action === "logout") {
      cookieStore.delete("admin_session");
      return NextResponse.json({ success: true });
    }

    if (action === "update_profile") {
      const isAdmin = cookieStore.get("admin_session")?.value === "adminootd_authenticated";
      if (!isAdmin) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }

      // Simpan perubahan foto profil admin
      if (typeof avatar_url === "string") {
        const existing = cookieStore.get("admin_profile")?.value;
        let data = { username: "adminootd", email: "adminootd@gmail.com", avatar_url: "" };
        if (existing) {
          try {
            data = JSON.parse(existing);
          } catch {}
        }
        data.avatar_url = avatar_url;

        cookieStore.set("admin_profile", JSON.stringify(data), {
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
          sameSite: "lax",
        });
      }

      // Simpan perubahan password admin
      if (new_password) {
        cookieStore.set("admin_password", new_password, {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 30,
          sameSite: "lax",
        });
      }

      return NextResponse.json({ success: true, message: "Profil admin berhasil diperbarui" });
    }

    return NextResponse.json({ success: false, message: "Aksi tidak dikenal" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
