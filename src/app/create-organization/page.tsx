import { CreateOrganization } from "@clerk/nextjs";

export default function CreateOrganizationPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-grey-50 p-4">
      <div className="mb-6 max-w-md text-center">
        <h1 className="font-display text-3xl text-grey-950">
          Name your workspace
        </h1>
        <p className="mt-2 text-grey-600">
          One last step before we build your AI operating system. This is the
          organization we&apos;ll attach your profile, agents, and billing to.
        </p>
      </div>
      <CreateOrganization
        afterCreateOrganizationUrl="/onboarding"
        skipInvitationScreen
      />
    </div>
  );
}
