// File: lib/auth-context.jsx
// Fungsi: Global state management untuk autentikasi (React Context).
// File ini bertanggung jawab untuk menyimpan siapa user yang sedang login,
// dan membagikan data tersebut ke seluruh komponen di aplikasi.

"use client"

// 1. Impor useEffect
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { mockLoginSSO } from "./api-mock"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  // 2. Ubah loading awal jadi true
  const [authState, setAuthState] = useState({
    user: null,
    isLoggedIn: false,
    loading: true, // <-- Penting: ubah jadi true
    error: null,
  })

  // 3. Tambahkan useEffect ini untuk membaca localStorage
  useEffect(() => {
    try {
      // Cek "kantong ajaib" (localStorage)
      const savedUser = localStorage.getItem("authUser");
      if (savedUser) {
        // Jika ada, set user-nya dan bilang selesai loading
        const user = JSON.parse(savedUser);
        setAuthState({
          user: user,
          isLoggedIn: true,
          loading: false, // <- Selesai loading
          error: null,
        });
      } else {
        // Jika tidak ada, bilang selesai loading
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    } catch (err) {
      // Jika datanya rusak (JSON error), anggap logout
      setAuthState({
        user: null,
        isLoggedIn: false,
        loading: false,
        error: "Sesi login Anda rusak, silakan login kembali.",
      });
      localStorage.removeItem("authUser");
    }
  }, []); // <-- Dependensi kosong artinya "jalan sekali saja saat app load"

  const login = useCallback(async (email, nama) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const user = await mockLoginSSO(email, nama)
      setAuthState((prev) => ({ ...prev, user, isLoggedIn: true, loading: false }))
      localStorage.setItem("authUser", JSON.stringify(user))
      return user
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login gagal"
      setAuthState((prev) => ({ ...prev, loading: false, error: errorMessage }))
      throw error
    }
  }, [])

  const logout = useCallback(() => {
    setAuthState({
      user: null,
      isLoggedIn: false,
      loading: false,
      error: null,
    })
    localStorage.removeItem("authUser")
  }, [])

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error("useAuth harus digunakan dalam AuthProvider")
  }
  
  return context
}