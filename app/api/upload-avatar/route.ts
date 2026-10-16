import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Gunakan service role key agar bisa upload ke Storage tanpa perlu login
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `avatar-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    // Coba upload ke Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from("avatars")
      .upload(filename, buffer, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      // Jika Supabase Storage gagal (misal bucket belum dibuat), fallback ke lokal
      console.warn("Supabase Storage upload gagal, fallback ke lokal:", error.message);

      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({ success: true, url: publicUrl, source: "local" });
    }

    // Dapatkan public URL dari Supabase
    const { data: urlData } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(data.path);

    return NextResponse.json({ success: true, url: urlData.publicUrl, source: "supabase" });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Gagal menyimpan file" }, { status: 500 });
  }
}
