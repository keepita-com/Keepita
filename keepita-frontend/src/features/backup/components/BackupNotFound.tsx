import React from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/features/backup/components/EmptyState";
import { AnimatedBackground } from "@/shared/components";

const BackupNotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-black flex items-center justify-center relative">
            <AnimatedBackground className="absolute inset-0 z-0" />
            <div className="max-w-lg w-full z-10 p-4">
                <EmptyState
                    icon="no-results"
                    title="Backup Not Found"
                    description="The backup you are looking for does not exist or you don't have permission to view it."
                />
                <div className="text-center -mt-10">
                    <button
                        onClick={() => navigate("/backups")}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
                    >
                        Return to Backups
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BackupNotFound;
