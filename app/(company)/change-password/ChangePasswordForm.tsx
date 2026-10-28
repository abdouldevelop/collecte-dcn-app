"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";

export function ChangePasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordChecks, setPasswordChecks] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecial: false,
  });

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, newPassword: password });
    setPasswordChecks({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[@#$%&*!]/.test(password),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    const allChecksPassed = Object.values(passwordChecks).every((check) => check);
    if (!allChecksPassed) {
      setError("Le nouveau mot de passe ne respecte pas les critères de sécurité");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/company/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        setIsLoading(false);
        return;
      }

      // Rediriger vers le dashboard après succès
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Current Password */}
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-[#374151] mb-1.5">
          Mot de passe temporaire
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Lock className="w-4 h-4 text-[#9CA3AF]" />
          </div>
          <input
            type={showCurrentPassword ? "text" : "password"}
            id="currentPassword"
            value={formData.currentPassword}
            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496559] focus:border-transparent"
            placeholder="Entrez votre mot de passe temporaire"
            required
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
          >
            {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-[#374151] mb-1.5">
          Nouveau mot de passe
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Lock className="w-4 h-4 text-[#9CA3AF]" />
          </div>
          <input
            type={showNewPassword ? "text" : "password"}
            id="newPassword"
            value={formData.newPassword}
            onChange={(e) => handlePasswordChange(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496559] focus:border-transparent"
            placeholder="Créez un nouveau mot de passe"
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
          >
            {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Password strength indicators */}
        {formData.newPassword && (
          <div className="mt-3 space-y-2">
            {[
              { check: passwordChecks.minLength, label: "Au moins 8 caractères" },
              { check: passwordChecks.hasUpperCase, label: "Une lettre majuscule" },
              { check: passwordChecks.hasLowerCase, label: "Une lettre minuscule" },
              { check: passwordChecks.hasNumber, label: "Un chiffre" },
              { check: passwordChecks.hasSpecial, label: "Un caractère spécial (@#$%&*!)" },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    item.check ? "text-green-600" : "text-gray-300"
                  }`}
                />
                <span
                  className={`text-xs ${
                    item.check ? "text-green-700" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#374151] mb-1.5">
          Confirmer le mot de passe
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Lock className="w-4 h-4 text-[#9CA3AF]" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full pl-10 pr-10 py-2.5 border border-[#D1D5DB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#496559] focus:border-transparent"
            placeholder="Confirmez votre nouveau mot de passe"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#496559] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#3d5447] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
      >
        {isLoading ? "Changement en cours..." : "Changer le mot de passe"}
      </button>
    </form>
  );
}
