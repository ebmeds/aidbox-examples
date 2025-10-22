import got from "got";
import { CapabilityStatement, Organization } from "fhir/r4";
import { sha256 } from "@/lib/utils";
import assert from "node:assert";
import { cache } from "react";

export const aidbox = got.extend({
  prefixUrl: process.env.AIDBOX_BASE_URL,
  headers: {
    Authorization: `Bearer ${process.env.AIDBOX_API_KEY}`,
  },
});

export const upsertOrganization = async (
  capabilityStatement: CapabilityStatement,
) => {
  const serverUrl = capabilityStatement?.implementation?.url;
  assert(serverUrl, "Server URL is required");

  const id = sha256(serverUrl);

  const software =
    `${capabilityStatement.software?.name || ""} ${capabilityStatement.software?.version || ""}`.trim() ||
    "";

  const implementation =
    `${capabilityStatement.implementation?.description || ""}`.trim() || "";

  const fhirVersion = capabilityStatement.fhirVersion || "";

  const name =
    `${software} ${implementation} ${fhirVersion}`
      .replace(/\s+/g, " ")
      .trim() || "Unknown";

  return aidbox
    .put(`Organization/${id}`, {
      json: {
        id,
        resourceType: "Organization",
        name,
        identifier: [
          { system: "aidbox-forms-smart-launch-2", value: serverUrl },
        ],
      },
    })
    .json<Organization>()
    .catch((e) => {
      console.error(`Failed to upsert organization: ${e.message}`);
      throw e;
    });
};

export const getOrganizationalAidbox = cache(async (serverUrl: string) => {
  const id = sha256(serverUrl);

  return aidbox.extend({
    prefixUrl: `${process.env.AIDBOX_BASE_URL}/Organization/${id}`,
    hooks: {
      afterResponse: [
        async response => {
          
          if (response.statusCode === 200 || response.statusCode === 201) {
            console.log(
              "[aidbox]",
              response.statusCode,
              response.headers["content-type"]
            );
          }
          
          return response
        },
      ],
    },
  });
});