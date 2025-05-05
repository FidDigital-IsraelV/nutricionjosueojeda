
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useData } from "@/context/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { currentUser } = useAuth();
  const { clients, nutritionists, trainers } = useData();
  
  // Find the user details based on their role
  const getUserDetails = () => {
    if (!currentUser) return null;
    
    if (currentUser.role === "client") {
      return clients.find(client => client.userId === currentUser.id);
    } else if (currentUser.role === "nutritionist") {
      return nutritionists.find(nutritionist => nutritionist.userId === currentUser.id);
    } else if (currentUser.role === "trainer") {
      return trainers.find(trainer => trainer.userId === currentUser.id);
    }
    
    return null;
  };
  
  const userDetails = getUserDetails();
  
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Format registration date
  const formattedDate = currentUser.membershipStartDate 
    ? new Date(currentUser.membershipStartDate).toLocaleDateString()
    : "No disponible";
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>
                {currentUser.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-semibold mb-1">{currentUser.name}</h2>
            <p className="text-muted-foreground capitalize mb-4">{currentUser.role}</p>
            
            <div className="w-full space-y-2 mt-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p>{currentUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Miembro desde</p>
                <p>{formattedDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detalles del Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            {userDetails ? (
              <div className="space-y-4">
                {currentUser.role === "client" && (
                  <>
                    {/* For clients, show personal details */}
                    <div>
                      <p className="text-sm text-muted-foreground">Edad</p>
                      <p>{userDetails && 'personalInfo' in userDetails && userDetails.personalInfo?.birthDate 
                        ? calculateAge(userDetails.personalInfo.birthDate) 
                        : "No disponible"} años</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Peso Actual</p>
                      <p>{userDetails && 'weight' in userDetails ? `${userDetails.weight} kg` : "No disponible"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Altura</p>
                      <p>{userDetails && 'personalInfo' in userDetails && userDetails.personalInfo?.height 
                        ? `${userDetails.personalInfo.height} cm` 
                        : "No disponible"}</p>
                    </div>
                  </>
                )}
                
                {(currentUser.role === "nutritionist" || currentUser.role === "trainer") && (
                  <div>
                    <p className="text-sm text-muted-foreground">Especialidad</p>
                    <p>{userDetails && 'specialty' in userDetails ? userDetails.specialty : "No especificada"}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">No hay información adicional disponible</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to calculate age from birthdate
const calculateAge = (birthdate: string): number => {
  const today = new Date();
  const birthDate = new Date(birthdate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

export default ProfilePage;
