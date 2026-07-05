import { IsUrl, IsNotEmpty, IsString, IsOptional, Length, Matches } from "class-validator";

export class UrlDto {
  @IsUrl({}, { message: "Invalid URL format" })
  @IsNotEmpty()
  url?: string;


  @IsString()
  @IsOptional()
  @Length(3,30, {message: "Length should be between 3 to 300"})
  @Matches(/^[a-zA-Z0-9-_]+$/, { message: "Custom code must only contain letters, numbers, hyphens, and underscores."})                                                                                                                                              
  CustomCode?: string;
}
